using Microsoft.EntityFrameworkCore;
using Try.Domain;

namespace Try.Repository.ProductRepository;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetProductsByCategoryId(int categoryId)
    {
        if (_context == null || _context.Products == null)
            throw new Exception("Contextul sau Products e null!");

        var produse = await _context.Products
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();

        if (produse == null)
            return new List<Product>();

        return produse;
    }
    
    public async Task<Product?> GetProductWithCategoryById(int id)
    {
        if (_context == null || _context.Products == null)
            throw new Exception("Contextul sau Products e null!");

        return await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.ProductId == id);
    }
    
    public async Task<IEnumerable<Product>> GetAllWithCategory()
    {
        return await _context.Products
            .Include(p => p.Category)
            .ToListAsync();
    }
    
    public IQueryable<Product> GetAllProductsQueryable()
    {
        return _context.Products.AsQueryable();
    }

    public void MarkCategoryAsUnchanged(Category category)
    {
        _context.Entry(category).State = EntityState.Unchanged;
    }


}