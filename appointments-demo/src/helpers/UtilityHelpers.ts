
export class UtilityHelpers {

    static formatTime(currentTime: string): string {
        if (currentTime && currentTime.length < 3) {
            currentTime = `${currentTime}:00`;
        }
        return currentTime;
    }
}
