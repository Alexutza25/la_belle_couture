using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Try.Domain;
using Try.DTO;
using Try.Service.CartService;
namespace Try.Controller;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    [EndpointSummary("Afișează toate coșurile existente")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _cartService.GetAllCarts();
        return Ok(result);
    }

    [HttpGet("{id}")]
    [EndpointSummary("Afișează un coș pe baza ID-ului")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _cartService.GetCartById(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [EndpointSummary("Creează un nou coș")]
    public async Task<IActionResult> Create([FromBody] Cart item)
    {
        var created = await _cartService.CreateCart(item);
        return CreatedAtAction(nameof(GetById), new { id = created.CartId }, created);
    }

    [HttpPut("{id}")]
    [EndpointSummary("Actualizează un coș existent")]
    public async Task<IActionResult> Update(int id, [FromBody] Cart item)
    {
        if (item.CartId != id) return BadRequest();
        var updated = await _cartService.UpdateCart(item);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [EndpointSummary("Șterge un coș după ID")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _cartService.DeleteCart(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
    
    [Authorize]
    [HttpGet("me")]
    [EndpointSummary("Afișează coșul userului logat")]
    public async Task<IActionResult> GetMyCart()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var cart = await _cartService.GetCartByUserId(userId);
        return Ok(cart);
    }
    
    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] CartDto dto)
    {
        var added = await _cartService.AddToCart(dto);
        if (!added) return BadRequest();
        return Ok();
    }
    
    [HttpPut("{cartId}/quantity")]
    public async Task<IActionResult> UpdateQuantity(int cartId, [FromBody] int quantity)
    {
        var updated = await _cartService.UpdateQuantity(cartId, quantity);
        return updated ? Ok() : NotFound();
    }
    
    [HttpDelete("clear/{userId}")]
    public async Task<IActionResult> ClearCart(int userId)
    {
        await _cartService.ClearCartByUserId(userId);
        return NoContent();
    }





}