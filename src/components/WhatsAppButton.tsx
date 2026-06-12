import whatsappLogo from "@/assets/WhatsApp.png";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5518997319946"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
      aria-label="WhatsApp"
    >
      <img src={whatsappLogo} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
    </a>
  );
};

export default WhatsAppButton;
