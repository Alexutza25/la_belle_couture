using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Try.Domain;
using Try.DTO;
using Try.Service;

namespace Try.Controller;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [EndpointSummary("Afișează toate comenzile")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _orderService.GetAllOrders();
        return Ok(result);
    }

    [HttpGet("{id}")]
    [EndpointSummary("Afișează o comandă după ID")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _orderService.GetOrderById(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var createdOrder = await _orderService.CreateOrder(dto);
            return Ok(createdOrder);
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ Order creation failed: " + ex.Message);
            return BadRequest("Something went wrong while creating the order.");
        }
    }


    [HttpPut("{id}")]
    [EndpointSummary("Actualizează o comandă existentă")]
    public async Task<IActionResult> Update(int id, [FromBody] Order item)
    {
        if (item.OrderId != id) return BadRequest();
        var updated = await _orderService.UpdateOrder(item);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [EndpointSummary("Șterge o comandă după ID")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _orderService.DeleteOrder(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
    
    [Authorize]
    [HttpGet("me")]
    [EndpointSummary("Afișează comenzile utilizatorului logat")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var orders = await _orderService.GetOrdersByUserId(userId);
        return Ok(orders);
    }
    
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetOrdersByUserId(int userId)
    {
        try
        {
            var orders = await _orderService.GetOrdersByUserId(userId);
            if (orders == null || !orders.Any())
                return Ok(new List<Order>());

            return Ok(orders);
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ EROARE la GetOrdersByUserId: " + ex.Message);
            return StatusCode(500, "A apărut o eroare la încărcarea comenzilor.");
        }
    }




}