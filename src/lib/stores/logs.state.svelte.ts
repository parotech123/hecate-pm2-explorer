export class Logging {
    logs = $state<string[] | {
        message: string;
        timestamp: Date;
        app_name: string;
        type: string;
        process_id: number
    }[]>([]);
    filterText = $state<string>('');

    filteredLogs =
        $derived.by(() => {
            if (!this.logs) return
            if (this.filterText == '') return this.logs

            let toReturn = this.logs.filter((line) => {
                if (typeof line === 'object' && line.message) {
                    return line.message
                        .toLowerCase()
                        .includes(this.filterText.toLowerCase())
                } else if (typeof line === 'string') {
                    return line.toLowerCase().includes(this.filterText.toLowerCase())
                }
            })

            return toReturn
        })

}
