using Try.Domain;
using Try.DTO;

namespace Try.Service;

public interface IOrderService
{
    public Task<IEnumerable<Order?>> GetAllOrders();
    public Task<Order?> GetOrderById(int id);
    public Task<Order?> CreateOrder(CreateOrderDto order);
    public Task<Order?> UpdateOrder(Order order);
    public Task<bool> DeleteOrder(int id);
    
     Task<IEnumerable<Order>> GetOrdersByUserId(int userId);
}