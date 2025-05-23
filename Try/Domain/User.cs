using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Try.Domain;


    [Table("User")] // Specifică denumirea tabelului în SQL Server
    public class User
    {
        [Key] // Marchez UserId ca fiind cheia primară
        public int UserId { get; set; }

        [Column("name")] // Maparea coloanei 'name' din baza de date
        public string Name { get; set; }

        [Column("e_mail")] // Maparea coloanei 'e_mail' din baza de date
        public string Email { get; set; }

        [Column("password")] // Maparea coloanei 'password' din baza de date
        public string Password { get; set; }

        [Column("phone")] // Maparea coloanei 'phone' din baza de date
        public string Phone { get; set; }
        

        [Column("type_user")] // Maparea coloanei 'type_user' din baza de date
        public string TypeUser { get; set; } // Client sau Administrator
        
        [ForeignKey("Address")]   
        public int AddressId { get; set; }
        public Address Address { get; set; }
        


    }
