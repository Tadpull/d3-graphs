import { IDimension } from "../objects/data";

function mergeDimensions(dim: IDimension, d1: string[], d2: string[]): Map<string[], string> | string[] {
  if (dim["DataType"] == 'DATETIME') {
    return dateMerge(dim, d1, d2);
  }
  else {
    return Array.from(new Set([...d1, ...d2])).sort();
  }
}

function dateMerge(dim: IDimension, d1: string[], d2: string[]): Map<string[], string> {
  let result = new Map<string[], string>();
  let success = false;
  //d1 = parseDates(dim, d1).sort((a: Date | string, b: Date | string) => (Number(a as string)) <= (Number(b as string)) || (a as Date) <= (b as Date) ? -1 : 1);
  //d2 = parseDates(dim, d2).sort((a: Date | string, b: Date | string) => (Number(a as string)) <= (Number(b as string)) || (a as Date) <= (b as Date) ? -1 : 1);
  try {
    let parsed1:number[] = d1.map(x => Number(x)).sort();
    let parsed2:number[] = d1.map(x => Number(x)).sort();

    if (dim["Name"] == "ga:month") {
      for (let i = 0; i < parsed1.length; i++) {
        result.set([parsed1[i].toString(), parsed2[i].toString()],
          parsed1[i] == parsed2[i] ? monthNames[parsed1[i]] : `${monthNames[parsed1[i]]}\n${monthNames[parsed2[i]]}`);
      }
    }

    else {
      for (let i = 0; i < parsed1.length; i++) {
        result.set([parsed1[i].toString(), parsed2[i].toString()],
          parsed1[i] == parsed2[i] ? parsed1[i].toString() : `${parsed1[i]}\n${parsed2[i]}`);
      }
    }
    success = true;
  }
  catch {
  }

  if (!success) {
    try {
      let parsed1 = d1.map(x => new Date(x)).sort();
      let parsed2 = d2.map(x => new Date(x)).sort();

      success = true;
    }
    catch { }
  }


  if (!success) {
    for (let i = 0; i < d1.length; i++) {
      result.set([d1[i], d2[i]], d1[i] == d2[i] ? d1[i] : `${d1[i]}\n${d2[i]}`)
    }
  }

  return result;

  ////see if the full date/string matches
  //for (let i = 0; !matched && i < d1.length && i < d2.length; i++) {
  //  matched = d1[i] == d2[i];
  //  if (!matched) {
  //    result.clear();
  //    break;
  //  }
  //  result.set([d1[i], d2[i]], d1[i])
  //}

  ////see if the dates & months match but not year
  //for (let i = 0; !matched && i < d1.length && i < d2.length; i++) {
  //  let d_1 = d1[i] as Date; let d_2 = d2[i] as Date;
  //  matched = d_1.getDate() == d_2.getDate()
  //    && d_1.getMonth() == d_2.getMonth()
  //    && d_1.getFullYear() != d_2.getFullYear();
  //  if (!matched) {
  //    result.clear();
  //    break;
  //  }
  //  result.set([d1[i], d2[i]], `${d_1.getMonth()}-${d_1.getDate()}`);
  //}


  //return result;
}
function parseDates(dim: IDimension, d: string[]): (Date | string)[]{
  return d.map((x: string) => parseDate(dim, x));
}

function parseDate(dim: IDimension, d: string): Date | string{
  let result: string | Date = d;
  if (typeof d == "string") {
    if ((new Date(d)).toString() != "Invalid Date") {
      result = new Date(d);
    }
    if (dim["Name"] == "ga:yearMonth") {
      result = new Date(Number(d.toString().substr(0, 4)), Number(d.toString().substr(4, 2)), 1);
    }
    else if (dim["Name"] == "ga:date") {
      //console.log(d);
      //console.log(Number(d.toString().substr(6, 2)))
      result = new Date(Number(d.toString().substr(0, 4)), Number(d.toString().substr(4, 2)), Number(d.toString().substr(6, 2)));
      result = `${result.getMonth()}/${result.getDate()}/${result.getFullYear()}`
    }
    else if (dim["Name"] == "ga:dateHour") {
      result = new Date(Number(d.toString().substr(0, 4)), Number(d.toString().substr(4, 2)), Number(d.toString().substr(6, 2)), 0, 0);
    }
    else if (dim["Name"] == "ga:dateHourMinute") {
      result = new Date(Number(d.toString().substr(0, 4)), Number(d.toString().substr(4, 2)), Number(d.toString().substr(6, 2)), Number(d.toString().substr(8, 2)), 0);
    }
    else if (dim["Name"] == "ga:yearWeek") {
      result = new Date(Number(d.toString().substr(0, 4)), 1, 1);
      result.setDate(result.getDate() + Number(d.toString().substr(4, 2)));
    }
  }
  
  else {

  }
  return result;
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export {
  dateMerge,
  parseDates, parseDate,
  monthNames,
  weekdayNames
}

export function mergeLabels(labels: string[]): string {
  let matched = true;
  let lab: string;
  for (let i = 0; i < labels.length && matched; i++) {
    matched = labels[i] == lab;
    lab = labels[i];
  }
  if (matched) { return lab; }
  else return labels.join(", ");
}

/**
 * 
 * @summary Merges the values for two sets of dates based on the dimension name
 * @example ga:month will merge month numbers into month names, e.g. 01 -> January, 02 -> February
 * @param dimName
 * @param dates1
 * @param dates2
 */
class StringDateTimeOffset {
  private date: Date | string;
  constructor(d: Date | string) {
    this.date = d;
  }
  public getFullYear(): number | string {
    if (this.date instanceof Date) {
      return this.date.getFullYear();
    }
    else {
      return (this.date as string).substr(0, 4);
    }
  }
  public getMonth(): number | string {
    if (this.date instanceof Date) {
      return this.date.getMonth();
    }
    else {
      return (this.date as string).substr(5, 2);
    }
  }
  public getDate(): number | string {
    if (this.date instanceof Date) {
      return this.date.getDate();
    }
    else {
      return Number.parseInt((this.date as string).substr(8, 2));
    }
  }

  public DateToUSString():string {
  return `${this.getMonth()}/${this.getDate()}/${(this.getFullYear() as number) % 100}`;
}

}

export function GetDateLabels(start: string | Date, end: string | Date, startc: string | Date, endc: string | Date): string[] {
  let result: string[];

  let s = new StringDateTimeOffset(start);
  let e = new StringDateTimeOffset(end);
  let sc = new StringDateTimeOffset(startc);
  let ec = new StringDateTimeOffset(endc);
  //if (!(s instanceof Date)) s = new Date(s);
  //if (!(e instanceof Date)) e = new Date(e);
  //if (!(sc instanceof Date)) sc = new Date(sc);
  //if (!(ec instanceof Date)) ec = new Date(ec);



  //year 1 and year 2
  if (s.getFullYear() == e.getFullYear() && sc.getFullYear() == ec.getFullYear() && s.getFullYear() != sc.getFullYear()) {
    result = [s.getFullYear().toString(), sc.getFullYear().toString()];
  }

  else if (s.getMonth() == e.getMonth() && sc.getMonth() == ec.getMonth() && s.getMonth() != sc.getMonth()) {
    result = [monthNames[s.getMonth()], monthNames[sc.getMonth()]];
  }
  else if (s.DateToUSString() == e.DateToUSString() && sc.DateToUSString() == ec.DateToUSString() && s.DateToUSString() != sc.DateToUSString()) {
    result = [
      `${s.DateToUSString()}`,
      `${sc.DateToUSString()}`,
    ];
  }

  else {
    result = [
      `${s.DateToUSString()} - ${e.DateToUSString()}`, 
      `${sc.DateToUSString()} - ${ec.DateToUSString()}`, 
    ];
  }

  return result;
}



function DateToUSString(date: Date) {
  return `${date.getMonth()}/${date.getDate()}/${date.getFullYear() % 100}`;
}

export function MapDateDimensions(dimName: string, dates1: string[], dates2?: string[]):
  { mapping: Map<string, string>, order: string[] } {
  let map = new Map<string, string>();
  let order = [];
  if (dimName == 'ga:date') {
    if (dates2 && (dates1.length != dates2.length)) {
      throw new Error("Date lengths do not match.");
    }
    if (dates1.length == 0) {
      throw new Error("No dates");
    }
    else if (dates1.length <= 365) {
      for (let i = 0; i < dates1.length; i++) {
        let parsed1 = `${Number(dates1[i].substring(4, 6))}/${Number(dates1[i].substring(6))}`;
        let parsed2 =  dates2 ? `${Number(dates2[i].substring(4, 6))}/${Number(dates2[i].substring(6))}` : parsed1;
        let merged = parsed1 == parsed2 ? parsed1 : `${parsed1}\n${parsed2}`;
        map[dates1[i]] = merged;
        if(dates2) map[dates2[i]] = merged;
      }
    }
    else {
      for (let i = 0; i < dates1.length; i++) {
        let parsed1 = `${Number(dates1[i].substring(4, 6))}/${Number(dates1[i].substring(6))}/${Number(dates1[i].substring(2,4))}`;
        let parsed2 = dates2 ?  `${Number(dates2[i].substring(4, 6))}/${Number(dates2[i].substring(6))}/${Number(dates2[i].substring(2, 4))}` : parsed1;
        let merged = parsed1 == parsed2 ? parsed1 : `${parsed1}\n${parsed2}`;
        map[dates1[i]] = merged;
        if(dates2) map[dates2[i]] = merged;
      }
    }
  }
  else if (dimName == 'ga:year' || dimName == "ga:minute" || dimName == "ga:hour" || dimName == "ga:day") {
    dates1.forEach(x => {
      map[x] = x;
    });
    order = dates1.map(x => Number(x));
    if (dates2) {
      dates2.forEach(x => {
        map[x] = x;
      });
      order = order.concat(dates2.map(x => Number(x)));
    }
    order = order.sort();
  }
  else if (dimName == 'ga:month') {
    dates1.forEach(x => {
      map[x] = monthNames[Number(x) - 1];
    });
    if (dates2) {
      dates2.forEach(x => {
        map[x] = monthNames[Number(x) - 1];
      });
    }
    console.log(map);
    order = monthNames;
  }
  else if (dimName == "ga:dayOfWeekName") {
    order = weekdayNames;
  }

  return {
    mapping: map,
    order: order
  };
}
