using System.ComponentModel.DataAnnotations;

namespace Try.DTO;

public class LoginDto
{
    [Required(ErrorMessage = "Email-ul este obligatoriu.")]
    [EmailAddress(ErrorMessage = "Format invalid de email.")]
    public string Email { get; set; }
    [Required(ErrorMessage = "Parola este obligatorie.")]
    public string Password { get; set; }
}