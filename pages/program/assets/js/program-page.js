const navigationToggle = document.querySelector(".navigationToggle");
const primaryNavigation = document.querySelector(".primaryNavigation");
const PHILIPPINE_EVENT_TIME_ZONE = "Asia/Manila";
const SPORTS_FEST_EVENT_DATE = "2026-07-17";
const CURRENT_POSITION_REFRESH_INTERVAL_MILLISECONDS = 30_000;
const PROGRAM_ENTRY_SELECTOR = "[data-program-entry]";

if (!navigationToggle || !primaryNavigation) {
  throw new Error("Required mobile navigation elements are missing.");
}

navigationToggle.addEventListener("click", () => {
  const navigationIsOpen = primaryNavigation.classList.toggle("isOpen");
  navigationToggle.setAttribute("aria-expanded", String(navigationIsOpen));
});

primaryNavigation.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) {
    return;
  }

  primaryNavigation.classList.remove("isOpen");
  navigationToggle.setAttribute("aria-expanded", "false");
});

class ProgramScheduleEntryModel {
  constructor({ scheduleEntryNumber, activityTitle, startTimeValue, startTimeLabel, endTimeValue, endTimeLabel }) {
    this.scheduleEntryNumber = ProgramScheduleEntryModel.requireText(scheduleEntryNumber, "schedule entry number");
    this.activityTitle = ProgramScheduleEntryModel.requireText(activityTitle, "activity title");
    this.startTimeLabel = ProgramScheduleEntryModel.requireText(startTimeLabel, "start time label");
    this.endTimeLabel = ProgramScheduleEntryModel.requireText(endTimeLabel, "end time label");
    this.startMinute = ProgramScheduleEntryModel.parseMinuteOfDay(startTimeValue, "start time");
    this.endMinute = ProgramScheduleEntryModel.parseMinuteOfDay(endTimeValue, "end time");

    if (this.startMinute >= this.endMinute) {
      throw new Error(`Program entry ${this.scheduleEntryNumber} must end after it starts.`);
    }

    Object.freeze(this);
  }

  static requireText(textValue, fieldName) {
    if (typeof textValue !== "string" || textValue.trim() === "") {
      throw new Error(`Program ${fieldName} is required.`);
    }

    return textValue.trim();
  }

  static parseMinuteOfDay(clockValue, fieldName) {
    const clockMatch = /^(\d{2}):(\d{2})$/.exec(ProgramScheduleEntryModel.requireText(clockValue, fieldName));

    if (!clockMatch) {
      throw new Error(`Program ${fieldName} must use 24-hour HH:MM format.`);
    }

    const hourNumber = Number(clockMatch[1]);
    const minuteNumber = Number(clockMatch[2]);

    if (hourNumber > 23 || minuteNumber > 59) {
      throw new Error(`Program ${fieldName} contains an invalid clock time.`);
    }

    return (hourNumber * 60) + minuteNumber;
  }
}

class SportsFestEventDateModel {
  constructor(eventDateValue) {
    const eventDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ProgramScheduleEntryModel.requireText(eventDateValue, "event date"));

    if (!eventDateMatch) {
      throw new Error("The Sports Fest event date must use YYYY-MM-DD format.");
    }

    const eventYear = Number(eventDateMatch[1]);
    const eventMonth = Number(eventDateMatch[2]);
    const eventDay = Number(eventDateMatch[3]);
    const validatedEventDate = new Date(Date.UTC(eventYear, eventMonth - 1, eventDay));

    if (
      validatedEventDate.getUTCFullYear() !== eventYear ||
      validatedEventDate.getUTCMonth() !== eventMonth - 1 ||
      validatedEventDate.getUTCDate() !== eventDay
    ) {
      throw new Error("The Sports Fest event date is invalid.");
    }

    this.dateValue = eventDateValue;
    this.displayLabel = new Intl.DateTimeFormat("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(validatedEventDate);
    Object.freeze(this);
  }
}

class ProgramScheduleCurrentPositionService {
  constructor(eventTimeZone, sportsFestEventDate) {
    this.eventTimeZone = ProgramScheduleEntryModel.requireText(eventTimeZone, "event time zone");
    if (!(sportsFestEventDate instanceof SportsFestEventDateModel)) {
      throw new Error("A validated Sports Fest event date is required.");
    }
    this.sportsFestEventDate = sportsFestEventDate;
    this.clockPartFormatter = new Intl.DateTimeFormat("en-PH", {
      timeZone: this.eventTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    this.clockLabelFormatter = new Intl.DateTimeFormat("en-PH", {
      timeZone: this.eventTimeZone,
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }

  determineCurrentPosition(currentInstant, programScheduleEntries) {
    if (!(currentInstant instanceof Date) || Number.isNaN(currentInstant.getTime())) {
      throw new Error("A valid current instant is required to determine the program position.");
    }

    if (!Array.isArray(programScheduleEntries) || programScheduleEntries.length === 0) {
      throw new Error("At least one program schedule entry is required.");
    }

    const currentDateValue = this.getCurrentDateValue(currentInstant);
    const firstScheduleEntry = programScheduleEntries[0];
    const lastScheduleEntry = programScheduleEntries[programScheduleEntries.length - 1];

    if (currentDateValue < this.sportsFestEventDate.dateValue) {
      return Object.freeze({
        scheduleEntryNumbers: [],
        timeLabel: `${this.clockLabelFormatter.format(currentInstant)} PHT`,
        title: "Event has not started",
        message: `The event begins on ${this.sportsFestEventDate.displayLabel} at ${firstScheduleEntry.startTimeLabel}.`
      });
    }

    if (currentDateValue > this.sportsFestEventDate.dateValue) {
      return Object.freeze({
        scheduleEntryNumbers: [],
        timeLabel: `${this.clockLabelFormatter.format(currentInstant)} PHT`,
        title: "Event finished",
        message: `The event program ended on ${this.sportsFestEventDate.displayLabel} at ${lastScheduleEntry.endTimeLabel}.`
      });
    }

    const currentMinute = this.getCurrentMinute(currentInstant);
    const currentScheduleEntries = programScheduleEntries.filter((programScheduleEntry) => (
      currentMinute >= programScheduleEntry.startMinute && currentMinute < programScheduleEntry.endMinute
    ));

    if (currentScheduleEntries.length > 0) {
      const activityTitles = currentScheduleEntries.map((programScheduleEntry) => programScheduleEntry.activityTitle);
      const scheduleEntryNumbers = currentScheduleEntries.map((programScheduleEntry) => programScheduleEntry.scheduleEntryNumber);
      const timeLabels = currentScheduleEntries.map((programScheduleEntry) => `${programScheduleEntry.startTimeLabel} – ${programScheduleEntry.endTimeLabel}`);

      return Object.freeze({
        scheduleEntryNumbers,
        timeLabel: `${this.clockLabelFormatter.format(currentInstant)} PHT`,
        title: activityTitles.join(" + "),
        message: currentScheduleEntries.length === 1 ? `${timeLabels[0]} · In progress now` : `${currentScheduleEntries.length} activities are in progress now.`
      });
    }

    if (currentMinute < firstScheduleEntry.startMinute) {
      return Object.freeze({
        scheduleEntryNumbers: [],
        timeLabel: `${this.clockLabelFormatter.format(currentInstant)} PHT`,
        title: "Program has not started",
        message: `${firstScheduleEntry.activityTitle} begins at ${firstScheduleEntry.startTimeLabel}.`
      });
    }

    if (currentMinute >= lastScheduleEntry.endMinute) {
      return Object.freeze({
        scheduleEntryNumbers: [],
        timeLabel: `${this.clockLabelFormatter.format(currentInstant)} PHT`,
        title: "Program finished",
        message: `The scheduled program ended at ${lastScheduleEntry.endTimeLabel}.`
      });
    }

    throw new Error("The current Philippine time does not match any program schedule entry.");
  }

  getCurrentDateValue(currentInstant) {
    const formattedClockParts = this.clockPartFormatter.formatToParts(currentInstant);
    const yearPart = formattedClockParts.find((clockPart) => clockPart.type === "year");
    const monthPart = formattedClockParts.find((clockPart) => clockPart.type === "month");
    const dayPart = formattedClockParts.find((clockPart) => clockPart.type === "day");

    if (!yearPart || !monthPart || !dayPart) {
      throw new Error("The Philippine calendar date could not be read from the current instant.");
    }

    return `${yearPart.value}-${monthPart.value}-${dayPart.value}`;
  }

  getCurrentMinute(currentInstant) {
    const formattedClockParts = this.clockPartFormatter.formatToParts(currentInstant);
    const hourPart = formattedClockParts.find((clockPart) => clockPart.type === "hour");
    const minutePart = formattedClockParts.find((clockPart) => clockPart.type === "minute");

    if (!hourPart || !minutePart) {
      throw new Error("Philippine time could not be read from the current instant.");
    }

    return (Number(hourPart.value) * 60) + Number(minutePart.value);
  }
}

class ProgramScheduleTimelineView {
  constructor() {
    this.programEntryElements = Array.from(document.querySelectorAll(PROGRAM_ENTRY_SELECTOR));
    this.currentPositionTimeElement = document.querySelector("#programCurrentPositionTime");
    this.currentPositionTitleElement = document.querySelector("#programCurrentPositionTitle");
    this.currentPositionMessageElement = document.querySelector("#programCurrentPositionMessage");

    if (this.programEntryElements.length === 0 || !this.currentPositionTimeElement || !this.currentPositionTitleElement || !this.currentPositionMessageElement) {
      throw new Error("Required program timeline elements are missing.");
    }
  }

  readScheduleEntries() {
    return this.programEntryElements.map((programEntryElement) => {
      const activityTitleElement = programEntryElement.querySelector(".programActivity h3");
      const scheduleTimeElements = programEntryElement.querySelectorAll(".programTime time");

      if (!activityTitleElement || scheduleTimeElements.length !== 2) {
        throw new Error(`Program entry ${programEntryElement.dataset.programEntry || "unknown"} is incomplete.`);
      }

      return new ProgramScheduleEntryModel({
        scheduleEntryNumber: programEntryElement.dataset.programEntry,
        activityTitle: activityTitleElement.textContent,
        startTimeValue: scheduleTimeElements[0].getAttribute("datetime"),
        startTimeLabel: scheduleTimeElements[0].textContent,
        endTimeValue: scheduleTimeElements[1].getAttribute("datetime"),
        endTimeLabel: scheduleTimeElements[1].textContent
      });
    });
  }

  renderCurrentPosition(currentPosition) {
    this.currentPositionTimeElement.textContent = currentPosition.timeLabel;
    this.currentPositionTitleElement.textContent = currentPosition.title;
    this.currentPositionMessageElement.textContent = currentPosition.message;

    this.programEntryElements.forEach((programEntryElement) => {
      const scheduleEntryIsCurrent = currentPosition.scheduleEntryNumbers.includes(programEntryElement.dataset.programEntry);
      programEntryElement.classList.toggle("isCurrent", scheduleEntryIsCurrent);

      if (scheduleEntryIsCurrent) {
        programEntryElement.setAttribute("aria-current", "step");
      } else {
        programEntryElement.removeAttribute("aria-current");
      }
    });
  }
}

class ProgramScheduleCurrentPositionController {
  constructor(programScheduleTimelineView, programScheduleCurrentPositionService, currentInstantProvider) {
    this.programScheduleTimelineView = programScheduleTimelineView;
    this.programScheduleCurrentPositionService = programScheduleCurrentPositionService;
    this.currentInstantProvider = currentInstantProvider;
    this.programScheduleEntries = this.programScheduleTimelineView.readScheduleEntries();
  }

  updateCurrentPosition() {
    const currentPosition = this.programScheduleCurrentPositionService.determineCurrentPosition(
      this.currentInstantProvider(),
      this.programScheduleEntries
    );
    this.programScheduleTimelineView.renderCurrentPosition(currentPosition);
  }
}

const programScheduleCurrentPositionController = new ProgramScheduleCurrentPositionController(
  new ProgramScheduleTimelineView(),
  new ProgramScheduleCurrentPositionService(
    PHILIPPINE_EVENT_TIME_ZONE,
    new SportsFestEventDateModel(SPORTS_FEST_EVENT_DATE)
  ),
  () => new Date()
);

programScheduleCurrentPositionController.updateCurrentPosition();
window.setInterval(
  () => programScheduleCurrentPositionController.updateCurrentPosition(),
  CURRENT_POSITION_REFRESH_INTERVAL_MILLISECONDS
);
