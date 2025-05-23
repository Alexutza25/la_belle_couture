using Try.Domain;

namespace Try.Repository;


public interface IOrderRepository : IRepository<Order>
{
    Task<List<Order>> GetOrdersByUserId(int userId);

}