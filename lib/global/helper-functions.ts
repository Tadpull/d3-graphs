import { IDimension } from "./dataObjects";

function dateMerge(dim: IDimension, d1: string[] | Date[], d2: string[] | Date[]): Map<(string | Date)[], string | Date>{
    let result = new Map<(string | Date)[], string | Date>();
    d1 = parseDates(dim, d1).sort((a: Date | string , b: Date | string) => (Number(a as string)) <= (Number(b as string)) || (a as Date) <= (b as Date) ? -1 : 1);
    d2 = parseDates(dim, d2).sort((a: Date | string, b: Date | string) => (Number(a as string)) <= (Number(b as string)) ||(a as Date) <= (b as Date) ? -1 : 1);
    let matched = false;

    //see if the full date/string matches
    for (let i = 0; !matched && i < d1.length && i < d2.length; i++) {
        matched = d1[i] == d2[i];
        if (!matched) {
            result.clear();
            break;
        }
        result.set([d1[i], d2[i]], d1[i])
    }

    //see if the dates & months match but not year
    for (let i = 0; !matched && i < d1.length && i < d2.length; i++) {
        let d_1 = d1[i] as Date; let d_2 = d2[i] as Date;
        matched = d_1.getDate() == d_2.getDate()
            && d_1.getMonth() == d_2.getMonth()
            && d_1.getFullYear() != d_2.getFullYear();
        if (!matched) {
            result.clear();
            break;
        }
        result.set([d1[i], d2[i]], `${d_1.getMonth()}-${d_1.getDate()}`);
    }


    return result;
}

function parseDates(dim: IDimension, d: string[] | Date[]): string[] | Date[] {
    return d.map((x: string | Date) => parseDate(dim, x)) as (string[] | Date[]);
}

function parseDate(dim: IDimension, d: string | Date): string | Date {
    let result: string | Date = "";
    if (dim.name == "ga:yearMonth") {
        result = new Date(Number(d.toString().substr(0, 4)), Number(d.toString().substr(4, 2)), 1);
    }
    else if (dim.name == "ga:date") {
        result = new Date(Number(d.toString().substr(0, 4)), Number(d.toString().substr(4, 2)), Number(d.toString().substr(6, 2)));
    }
    else if (dim.name == "ga:dateHour") {
        result = new Date(Number(d.toString().substr(0, 4)), Number(d.toString().substr(4, 2)), Number(d.toString().substr(6, 2)), 0, 0);
    }
    else if (dim.name == "ga:dateHourMinute") {
        result = new Date(Number(d.toString().substr(0, 4)), Number(d.toString().substr(4, 2)), Number(d.toString().substr(6, 2)), Number(d.toString().substr(8,2)), 0);
    }
    else if (dim.name == "ga:yearWeek") {
        result = new Date(Number(d.toString().substr(0, 4)), 1, 1);
        result.setDate(result.getDate() + Number(d.toString().substr(4, 2)));
    }
    else {

    }
    return result;
}