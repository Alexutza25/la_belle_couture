using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Try.Domain;

[Table("OrderDetails")]
public class OrderDetails
{
   [Key]
   [Column("order_detailsID")]
   public int OrderDetailsId { get; set; }
   [JsonIgnore]
   public Order Order { get; set; } = null!;   // navigare

   [ForeignKey("Order")]
   public int OrderId { get; set; }
   [Column("variantId")] // ← denumirea coloanei din SQL!
   public int VariantId { get; set; }

   [ForeignKey("VariantId")]
   public ProductVariant ProductVariant { get; set; }

   [Column("quantity")]
   public int Quantity { get; set; } 
   [Column("price")]
   public decimal Price { get; set; }
   [Column("subtotal")]
   public decimal Subtotal { get; set; }
}