export const calculateSisaWaktu = (deadline: string): number => {
    if (!deadline) {
        return 0;
    }

    const deadlineDate = new Date(deadline);
    // Setting time to 0 to compare dates only
    deadlineDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const sisaWaktu = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return sisaWaktu;
};
