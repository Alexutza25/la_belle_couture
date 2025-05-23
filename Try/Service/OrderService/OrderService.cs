using Try.Domain;
using Try.DTO;
using Try.Repository;

namespace Try.Service;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;

    public OrderService(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }


    public async Task<IEnumerable<Order>> GetAllOrders()
    {
        return await _orderRepository.GetAll();
    }

    public async Task<Order?> GetOrderById(int id)
    {
        return await _orderRepository.GetById(id);
    }

    public async Task<Order> CreateOrder(CreateOrderDto dto)
    {
        var order = new Order
        {
            UserId = dto.UserId,
            PaymentMethod = dto.PaymentMethod,
            Date = DateTime.Now,
            Status = "Pending",
            Total = dto.OrderDetails.Sum(d => d.Subtotal),
            OrderDetails = dto.OrderDetails.Select(d => new OrderDetails
            {
                VariantId = d.VariantId,
                Quantity = d.Quantity,
                Price = d.Price,
                Subtotal = d.Subtotal
            }).ToList()
        };

        await _orderRepository.Add(order);
        return order;
    }


    public async Task<Order?> UpdateOrder(Order order)
    {
        await _orderRepository.Update(order);
        return order;
    }

    public async Task<bool> DeleteOrder(int id)
    {
        var order = await _orderRepository.GetById(id);
        if (order == null)
        {
            return false;
        }

        await _orderRepository.Delete(id);
        return true;
    }
    
    public async Task<IEnumerable<Order>> GetOrdersByUserId(int userId)
    {
        return await _orderRepository.GetOrdersByUserId(userId);
    }

}