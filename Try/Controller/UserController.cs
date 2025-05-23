using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Try.Authorize;
using Try.Domain;
using Try.DTO;
using Try.Service.UserService;
namespace Try.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    
    private readonly JwtService _jwtService;

    public UserController(IUserService userService, JwtService jwtService)
    {
        _userService = userService;
        _jwtService = jwtService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsers();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userService.GetUserById(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    [EndpointSummary( "Creează un nou utilizator")]
    public async Task<IActionResult> CreateUser( [FromBody] User user)
    {
        var created = await _userService.CreateUser(user);
        return CreatedAtAction(nameof(GetUserById), new { id = created.UserId }, created);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updatedUser)
    {
        var result = await _userService.UpdateUser(id, updatedUser);
        if (result == null) return NotFound();
        return Ok(result);
    }

    
    [HttpDelete("{id}")]
    [EndpointSummary( "Sterge utilizator")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleted = await _userService.DeleteUser(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
    
    [HttpPost("register")]
    [AllowAnonymous]
    [EndpointSummary("Cream un cont nou")]
    public async Task<IActionResult> Register([FromBody] SignUpDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var user = await _userService.RegisterUser(dto);
            return Ok(new { message = "User registered successfully 💖", userId = user.UserId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
    
    [HttpPost("login")]
    [AllowAnonymous]
    [EndpointSummary("Autentificare utilizator")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            Console.WriteLine($"[LOGIN] Email: {dto.Email}");

            var user = await _userService.Authenticate(dto.Email, dto.Password);

            if (user == null)
            {
                Console.WriteLine("[LOGIN] User nu a fost gasit.");
                return Unauthorized(new { message = "Email sau parolă incorecte 😥" });
            }

            Console.WriteLine($"[LOGIN] UserId: {user.UserId}");

            if (user.UserId == 0)
                return StatusCode(500, new { message = "ID-ul userului este invalid. 😵" });

            var token = _jwtService.GenerateToken(user.UserId, user.TypeUser);

            Console.WriteLine($"[LOGIN] Token generat cu succes");

            return Ok(new
            {
                token,
                userId = user.UserId,
                name = user.Name,
                email = user.Email,
                typeUser = user.TypeUser
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine("[EROARE LOGIN] " + ex.Message);
            Console.WriteLine(ex.StackTrace);
            return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
        }
    }
    
    [HttpGet("address/{userId}")]
    public async Task<IActionResult> GetAddressByUserId(int userId)
    {
        var user = await _userService.GetUserById(userId);
        var address = await _userService.GetAddressByUserId(userId);
        if (user == null || address == null)
            return NotFound();

        return Ok(address);
    }

    




}