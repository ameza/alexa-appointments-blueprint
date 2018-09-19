
export class UtilityHelpers {

    static formatTime(currentTime: string): string {
        if (currentTime && currentTime.length < 3) {
            currentTime = `${currentTime}:00`;
        }
        return currentTime;
    }

    static shouldIbookItHelper(): string {
        const items = ["do you want to book it ?", "should I proceed booking?"]
        return items[Math.floor(Math.random() * items.length)];

    }
}
