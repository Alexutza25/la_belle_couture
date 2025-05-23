using Azure.Core;
using Microsoft.EntityFrameworkCore;
using Try.Domain;
using Try.Repository;

namespace Try.Repository;
public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<List<Order>> GetOrdersByUserId(int userId)
    {
        return await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.ProductVariant)
            .ThenInclude(pv => pv.Product)
            .ToListAsync();
    }


}