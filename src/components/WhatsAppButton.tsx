import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5518997319946"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
      aria-label="WhatsApp"
    >
      <MessageCircle size={26} className="text-[#fff]" />
    </a>
  );
};

export default WhatsAppButton;
