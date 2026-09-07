export type Notification = {
	id: number;
	sender: string;
	subject: string;
	content: string;
	sentAt: string;
	priority: 'HIGH' | 'LOW';
	read: boolean;
};

export const notificationData: Notification[] = [
	{ id: 1, sender: 'eTax Indonesia', subject: 'Hasil unggah faktur pajak keluaran telah tersedia.', content: 'Proses unggah faktur pajak keluaran berhasil. Hasil pemrosesan telah tersedia.', sentAt: '04/09/2026 21:26', priority: 'HIGH', read: false },
	{ id: 2, sender: 'eTax Indonesia', subject: 'Hasil unggah faktur pajak keluaran telah tersedia.', content: 'Proses unggah faktur pajak keluaran berhasil. Hasil pemrosesan telah tersedia.', sentAt: '04/09/2026 20:52', priority: 'HIGH', read: false },
	{ id: 3, sender: 'eTax Indonesia', subject: 'Anda menerima bukti pemotongan atau pemungutan baru. Silakan cek detail.', content: 'Anda menerima bukti pemotongan atau pemungutan baru. Silakan periksa detail bukti potong pada menu eBupot.', sentAt: '27/08/2026 19:49', priority: 'LOW', read: true },
	{ id: 4, sender: 'eTax Indonesia', subject: 'Dokumen perpajakan baru telah diterbitkan untuk akun Anda.', content: 'Dokumen perpajakan baru telah diterbitkan dan dapat dilihat pada menu Dokumen Saya.', sentAt: '26/08/2026 16:57', priority: 'LOW', read: true },
	{ id: 5, sender: 'eTax Indonesia', subject: 'Kode billing berhasil dibuat.', content: 'Kode billing berhasil dibuat dan siap digunakan.', sentAt: '11/08/2026 10:15', priority: 'HIGH', read: true }
];
