using System.ComponentModel.DataAnnotations;

namespace Try.DTO;

public class SignUpDto
{
    [Required(ErrorMessage = "Please enter your name")]
    public string Name { get; set; }

    [Required(ErrorMessage = "Please enter your email")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Please enter your password")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    public string Password { get; set; }

   [Phone(ErrorMessage = "Please enter your phone number")]
    public string Phone { get; set; }

    [Required(ErrorMessage = "TypeUser is required.")]
    [RegularExpression("^(Client|Administrator)$", ErrorMessage = "TypeUser must be 'Client' or 'Administrator'.")]
    public string TypeUser { get; set; }
    public AddressDto Address { get; set; }
}