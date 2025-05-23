using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Try.Domain;
using Try.DTO;
using Try.Service.ProductService;

namespace Try.Controller;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [EndpointSummary("Afișează toate produsele")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _productService.GetAllProducts();
        return Ok(result);
    }

    [HttpGet("{id}")]
    [EndpointSummary("Afișează un produs după ID")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _productService.GetProductById(id);
        if (result == null) return NotFound();
        return Ok(result);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            Price = dto.Price,
            Colour = dto.Colour,
            Material = dto.Material,
            ImageURL = dto.ImageURL
        };

         _productService.CreateProduct(product);

        return Ok(product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductDto dto)
    {
        var product = new Product
        {
            ProductId = id, // ID-ul vine din URL!
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Colour = dto.Colour,
            Material = dto.Material,
            ImageURL = dto.ImageURL,
            CategoryId = dto.CategoryId
        };

        var updated = await _productService.UpdateProduct(product);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [EndpointSummary("Șterge un produs după ID")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _productService.DeleteProduct(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
    
    [HttpGet("category/{categoryId}")]
    [EndpointSummary("Afișează produsele dintr-o categorie")]
    public async Task<IActionResult> GetByCategory(int categoryId)
    {
        var result = await _productService.GetProductsByCategoryId(categoryId);
        return Ok(result);
    }
    
    [HttpGet("search-by-name")]
    public async Task<IActionResult> SearchByName([FromQuery] string? name)
    {
        var results = await _productService.SearchProducts(name);
        return Ok(results);
    }
    
    [HttpPost("filter")]
    public IActionResult GetFilteredProducts([FromBody] ProductFiltersDto filters)
    {
        var filteredProducts = _productService.GetFilteredProducts(filters);
        return Ok(filteredProducts);
    }

    [HttpGet("categories")]
    public IActionResult GetCategories()
    {
        var categories = _productService.GetAllCategories();
        return Ok(categories);
    }

    [HttpGet("colors")]
    public IActionResult GetColors()
    {
        var colors = _productService.GetAllColors();
        return Ok(colors);
    }

    [HttpGet("materials")]
    public IActionResult GetMaterials()
    {
        var materials = _productService.GetAllMaterials();
        return Ok(materials);
    }

    [HttpGet("price-range")]
    public IActionResult GetPriceRange()
    {
        var (min, max) = _productService.GetPriceRange();
        return Ok(new { min, max });
    }

}