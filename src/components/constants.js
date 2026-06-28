import char1 from "../assets/char-1.jpg";
import char2 from "../assets/char-2.jpg";
import char3 from "../assets/char-3.jpg";
import char4 from "../assets/char-4.jpg";

export const SERVER_IP = "51.83.189.2:7777";

export const FEATURES = [
  {
    n: "01",
    title: "რეალური ეკონომიკა",
    text: "დაბალანსებული ფასები, ბანკები, ბირჟა და უამრავი გზა ფულის საშოვნელად — ლეგალური თუ არა.",
    icon: "₾",
  },
  {
    n: "02",
    title: "ფრაქციები",
    text: "გახდი პოლიციელი, ექიმი, FBI-ის აგენტი ან კრიმინალური სამყაროს ლიდერი.",
    icon: "★",
  },
  {
    n: "03",
    title: "უნიკალური სისტემები",
    text: "ახალი ინვენტარი, მანქანის ტუნინგი, საკუთარი სახლები და ბიზნესები.",
    icon: "⚙",
  },
  {
    n: "04",
    title: "24/7 ცხოვრება",
    text: "სერვერი მუშაობს დღე-ღამე. ნებისმიერ დროს აქტიურად.",
    icon: "◐",
  },
];

export const CHARACTERS = [
  { img: char1, name: "NEMOS", role: "Vagos Boss", color: "#ff2d78" },
  { img: char2, name: "JENNIFER", role: "LSPD Officer", color: "#3fa9ff" },
  { img: char3, name: "CARLO", role: "MAFIA", color: "#ff9e2d" },
  { img: char4, name: "MICHAEL", role: "FBI", color: "#2dff9e" },
];

export const SPECS = [
  { label: "პროცესორი", value: "Intel Core N4000" },
  { label: "ოპერატიული", value: "4 GB RAM" },
  { label: "ვიდეობარათი", value: "Intel UHD 600" },
  { label: "თავისუფალი ადგილი", value: "4 GB" },
];

export { char1, char2, char3, char4 };
