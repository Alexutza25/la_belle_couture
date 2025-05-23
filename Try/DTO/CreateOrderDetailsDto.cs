using System.ComponentModel.DataAnnotations;

namespace Try.DTO;

public class CreateOrderDetailsDto
{
    [Required(ErrorMessage = "ID-ul variantei de produs este obligatoriu.")]
    public int VariantId { get; set; }
    [Required(ErrorMessage = "Cantitatea este obligatorie.")]
    [Range(1, int.MaxValue, ErrorMessage = "Cantitatea trebuie să fie de minim 1.")]
    
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Subtotal { get; set; }
}
