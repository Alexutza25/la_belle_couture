using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Try.Pages;

public class Signup1Model : PageModel
{
    [BindProperty]
    public string Name { get; set; }

    [BindProperty]
    public string Email { get; set; }

    [BindProperty]
    public string Phone { get; set; }

    [BindProperty]
    public string Password { get; set; }

    [BindProperty]
    public string TypeUser { get; set; }
    
    [BindProperty]
    public string ConfirmPassword { get; set; }

    public void OnGet() { }
}