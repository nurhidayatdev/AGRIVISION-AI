/**
 * Utility untuk mengirim pesan WhatsApp menggunakan API Fonnte
 */

export const sendWhatsAppMessage = async (target: string, message: string) => {
  const token = import.meta.env.VITE_FONNTE_TOKEN;
  
  if (!token) {
    console.warn("VITE_FONNTE_TOKEN belum di-set di .env. Pesan WA tidak dikirim.");
    return false;
  }

  if (!target) {
    console.error("Nomor tujuan WhatsApp tidak boleh kosong.");
    return false;
  }

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": token,
      },
      body: new URLSearchParams({
        target: target,
        message: message,
        countryCode: "62", // Default Indonesia
      }),
    });

    const result = await response.json();
    
    if (result.status) {
      console.log(`WhatsApp terkirim sukses ke ${target}`);
      return true;
    } else {
      console.error(`Fonnte API Error: ${result.reason}`);
      return false;
    }
  } catch (error) {
    console.error("Gagal melakukan fetch ke Fonnte API:", error);
    return false;
  }
};
