using System;
using System.Reflection.Metadata;
using System.Transactions;
namespace Try
{
    class Program
    {
        static void MyMethod1(string name, int age)
        {
            Console.Write(name + " hola ");
            if (age >= 18)
            {
                Console.WriteLine("You\'re allowed to vote!");
            }
            else Console.WriteLine("You can\'t vote yet!");
        }

        static void MyMethod2(string name = "NO", int age = 0) {
            MyMethod1(name, age);         
        }

        static void MyMethod1(int age)
        {
            if (age >= 18)
            {
                Console.WriteLine("You\'re allowed to vote!");
            }
            else Console.WriteLine("You can\'t vote yet!");
        }

        static void Main(string[] args)
        {
            Console.WriteLine("Salut! Sa incepem");
            /*Console.WriteLine(3 + 13);
            Console.Write(13 + 2);
            Console.WriteLine(12+3);
            int numar;
            numar = 17;
            Console.WriteLine(numar);
            string nume = "Ale";
            Console.WriteLine("Buna " + nume + "! Sa incepem!");
            long nrMare = 122222L;
            float nrFractie = 35e3F;
            double nrFractieMare = 1.2E4D;
            Console.WriteLine(nrMare + " " + nrFractie + " " + nrFractieMare);
            Console.WriteLine(Convert.ToString(nrFractieMare));


            Console.WriteLine("Enter your name and age");
            string name_age = Console.ReadLine();
            int pos = name_age.IndexOf(" ")+1;
            string age = name_age.Substring(pos);
            int ageI = Convert.ToInt32(age);
            string name = name_age.Substring(0, pos-1);
            Console.Write(name + ", ");
            if(ageI >= 18)
            {
                Console.Write("esti major");
            }
            else
            {
                Console.Write("esti minor");
            }
            if (name[pos-2].Equals('a'))
            {
                Console.WriteLine("a");
            }
            
            Console.WriteLine("Enter a number between 1 and 3 :) ");
            string dayS = Console.ReadLine();
            Console.Write("It\'s ");
            switch (dayS)
            {
               
                case "1":
                    Console.WriteLine("Monday");
                    break;
                case "2":
                    Console.WriteLine("Tuesday");
                    break;
                case "3":
                    Console.WriteLine("Wednesday");
                    break;
                default: Console.WriteLine("Weekend :))) "); break;
            }


            string[] masini = { "Jetuta", "Skodita", "Passat", "Volvo", "Audi" };
            for(int i = 0; i<masini.Length -1; i++)
            {
                string i1 = masini[i];
                for (int j = i; j < masini.Length; j++)
                {
                    string j1 = masini[j];  
                    if (i1[0] > j1[0])
                    {
                        string aux = masini[i];
                        masini[i] = masini[j];
                        masini[j] = aux;
                    }
}
            }
            foreach(string i in masini)
            { Console.WriteLine(i); }
            */
            MyMethod1("Ana", 15);
            MyMethod1(23);
            MyMethod1("Marian", 18);
            MyMethod2("Ale", 20);
            MyMethod2("Ramona", 42);
            MyMethod2();
        }
    }
}