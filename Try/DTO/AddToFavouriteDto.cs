using System.ComponentModel.DataAnnotations;

namespace Try.DTO;

public class AddToFavouriteDto
{
    [Required(ErrorMessage = "ID-ul utilizatorului este obligatoriu.")]
    public int UserId { get; set; }
    [Required(ErrorMessage = "ID-ul variantei de produs este obligatoriu.")]
    public int VariantId { get; set; }
}