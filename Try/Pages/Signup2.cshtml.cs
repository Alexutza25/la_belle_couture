using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http.Json;
using Try.DTO;

namespace Try.Pages;

public class Signup2Model : PageModel
{
    [BindProperty(SupportsGet = true)]
    public string Name { get; set; }

    [BindProperty(SupportsGet = true)]
    public string Email { get; set; }

    [BindProperty(SupportsGet = true)]
    public string Phone { get; set; }

    [BindProperty(SupportsGet = true)]
    public string Password { get; set; }

    [BindProperty(SupportsGet = true)]
    public string TypeUser { get; set; }
    
    [BindProperty]
    public AddressDto Address { get; set; }

    public async Task<IActionResult> OnPostAsync()
    {
        // Construim obiectul de tip SignUpDto
        var user = new SignUpDto
        {
            Name = Name,
            Email = Email,
            Password = Password,
            Phone = Phone,
            TypeUser = TypeUser,
            Address = Address
        };

        using var httpClient = new HttpClient();
        var response = await httpClient.PostAsJsonAsync("https://localhost:5180/api/User/register", user);

        if (response.IsSuccessStatusCode)
        {
            TempData["SuccessMessage"] = $"Te-ai înregistrat cu succes, {Name}! ";
            return RedirectToPage("Login");
        }

        ModelState.AddModelError(string.Empty, "A apărut o eroare la înregistrare. ");
        return Page();
    }
    
    public void OnGet() {}

    public IActionResult OnPost()
    {
        TempData["SuccessMessage"] = $"{Name} din {Address.City}, {Address.County} s-a înregistrat cu {Email}!";
        return RedirectToPage("Login");
    }
}