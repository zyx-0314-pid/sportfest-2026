const navigationToggle = document.querySelector(".navigationToggle");
const primaryNavigation = document.querySelector(".primaryNavigation");
const DICEBEAR_OPEN_PEEPS_AVATAR_ENDPOINT = "https://api.dicebear.com/10.x/open-peeps/svg";
const ACTIVE_BADMINTON_MATCH_IDS = Object.freeze(["M1", "M2"]);

const BADMINTON_PAIR_ENTRIES = Object.freeze([
  { pairId: "pairA", pairLabel: "Pair A", playerNames: ["Bea", "Meg"] },
  { pairId: "pairB", pairLabel: "Pair B", playerNames: ["Kiah", "Ed"] },
  { pairId: "pairC", pairLabel: "Pair C", playerNames: ["Len", "Sam"] },
  { pairId: "pairD", pairLabel: "Pair D", playerNames: ["Leo", "Joanna"] },
  { pairId: "pairE", pairLabel: "Pair E", playerNames: ["Ivan", "Dzeljlah"] },
  { pairId: "pairF", pairLabel: "Pair F", playerNames: ["Wino", "Khajel"] },
  { pairId: "pairG", pairLabel: "Pair G", playerNames: ["Mariel", "Ermeo"] }
]);

const BADMINTON_MATCH_ENTRIES = Object.freeze([
  {
    setNumber: 1,
    courtLabel: "Court 1",
    matchId: "M1",
    teamOneSource: { pairId: "pairA" },
    teamTwoSource: { pairId: "pairB" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M4" },
    loserDestination: { destinationType: "match", destinationLabel: "M6" }
  },
  {
    setNumber: 1,
    courtLabel: "Court 2",
    matchId: "M2",
    teamOneSource: { pairId: "pairC" },
    teamTwoSource: { pairId: "pairD" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M5" },
    loserDestination: { destinationType: "match", destinationLabel: "M6" }
  },
  {
    setNumber: 2,
    courtLabel: "Court 1",
    matchId: "M3",
    teamOneSource: { pairId: "pairE" },
    teamTwoSource: { pairId: "pairF" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M5" },
    loserDestination: { destinationType: "match", destinationLabel: "M8" }
  },
  {
    setNumber: 2,
    courtLabel: "Court 2",
    matchId: "M4",
    teamOneSource: { pairId: "pairG" },
    teamTwoSource: { proceedingMatchId: "M1", proceedingOutcome: "winner" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M7" },
    loserDestination: { destinationType: "match", destinationLabel: "M8" }
  },
  {
    setNumber: 3,
    courtLabel: "Court 1",
    matchId: "M5",
    teamOneSource: { proceedingMatchId: "M2", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M3", proceedingOutcome: "winner" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M7" },
    loserDestination: { destinationType: "match", destinationLabel: "M9" }
  },
  {
    setNumber: 3,
    courtLabel: "Court 2",
    matchId: "M6",
    teamOneSource: { proceedingMatchId: "M1", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M2", proceedingOutcome: "loser" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M9" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 4,
    courtLabel: "Court 1",
    matchId: "M7",
    teamOneSource: { proceedingMatchId: "M4", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M5", proceedingOutcome: "winner" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "Finals" },
    loserDestination: { destinationType: "match", destinationLabel: "M10" }
  },
  {
    setNumber: 4,
    courtLabel: "Court 2",
    matchId: "M8",
    teamOneSource: { proceedingMatchId: "M3", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M4", proceedingOutcome: "loser" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M10" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 5,
    courtLabel: "Court 1",
    matchId: "M9",
    teamOneSource: { proceedingMatchId: "M5", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M6", proceedingOutcome: "winner" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M11" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 5,
    courtLabel: "Court 2",
    matchId: "M10",
    teamOneSource: { proceedingMatchId: "M7", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M8", proceedingOutcome: "winner" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M11" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 6,
    courtLabel: "Court 1",
    matchId: "M11",
    teamOneSource: { proceedingMatchId: "M9", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M10", proceedingOutcome: "winner" },
    winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "Finals" },
    loserDestination: { destinationType: "placement", destinationLabel: "3rd Place Winner" }
  },
  {
    setNumber: 6,
    courtLabel: "Court 2",
    matchId: "Finals",
    teamOneSource: { proceedingMatchId: "M7", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M11", proceedingOutcome: "winner" },
    winningPairId: null,
    winnerDestination: { destinationType: "placement", destinationLabel: "Champion" },
    loserDestination: { destinationType: "placement", destinationLabel: "2nd Place Winner" }
  }
]);

const PARTICIPANT_OUTCOMES = Object.freeze(["winner", "loser"]);
const DESTINATION_TYPES = Object.freeze(["match", "placement", "eliminated"]);
const PENDING_RESULT_LABEL = "Pending";

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

class BadmintonPairModel {
  constructor({ pairId, pairLabel, playerNames }) {
    this.pairId = BadmintonPairModel.requireText(pairId, "pair ID");
    this.pairLabel = BadmintonPairModel.requireText(pairLabel, "pair label");

    if (!Array.isArray(playerNames) || playerNames.length !== 2) {
      throw new Error(`${this.pairLabel} must contain exactly two player names.`);
    }

    this.playerNames = Object.freeze(playerNames.map((playerName) => (
      BadmintonPairModel.requireText(playerName, `${this.pairLabel} player name`)
    )));
    Object.freeze(this);
  }

  static requireText(textValue, fieldLabel) {
    if (typeof textValue !== "string" || textValue.trim() === "") {
      throw new Error(`Badminton ${fieldLabel} is required.`);
    }

    return textValue.trim();
  }

  get displayLabel() {
    return `${this.pairLabel} — ${this.playerNames.join(" / ")}`;
  }
}

class BadmintonParticipantSourceModel {
  constructor({ pairId, proceedingMatchId, proceedingOutcome }) {
    const hasPairId = typeof pairId === "string" && pairId.trim() !== "";
    const hasProceedingMatch = typeof proceedingMatchId === "string" && proceedingMatchId.trim() !== "";

    if (hasPairId === hasProceedingMatch) {
      throw new Error("Each badminton participant source must contain either one pair ID or one proceeding match.");
    }

    if (hasPairId) {
      if (proceedingOutcome !== undefined) {
        throw new Error(`Initial pair ${pairId} cannot contain a proceeding outcome.`);
      }

      this.pairId = pairId.trim();
      this.proceedingMatchId = null;
      this.proceedingOutcome = null;
    } else {
      if (!PARTICIPANT_OUTCOMES.includes(proceedingOutcome)) {
        throw new Error(`Proceeding match ${proceedingMatchId} must specify a winner or loser outcome.`);
      }

      this.pairId = null;
      this.proceedingMatchId = proceedingMatchId.trim();
      this.proceedingOutcome = proceedingOutcome;
    }

    Object.freeze(this);
  }
}

class BadmintonDestinationModel {
  constructor({ destinationType, destinationLabel }) {
    if (!DESTINATION_TYPES.includes(destinationType)) {
      throw new Error(`Badminton destination type ${destinationType || "missing"} is invalid.`);
    }

    this.destinationType = destinationType;
    this.destinationLabel = BadmintonPairModel.requireText(destinationLabel, "destination label");
    Object.freeze(this);
  }
}

class BadmintonMatchModel {
  constructor(matchEntry) {
    if (!Number.isInteger(matchEntry.setNumber) || matchEntry.setNumber < 1) {
      throw new Error("Badminton set number must be a positive integer.");
    }

    this.setNumber = matchEntry.setNumber;
    this.courtLabel = BadmintonPairModel.requireText(matchEntry.courtLabel, "court label");
    this.matchId = BadmintonPairModel.requireText(matchEntry.matchId, "match ID");
    this.teamOneSource = new BadmintonParticipantSourceModel(matchEntry.teamOneSource);
    this.teamTwoSource = new BadmintonParticipantSourceModel(matchEntry.teamTwoSource);
    this.winningPairId = matchEntry.winningPairId === null
      ? null
      : BadmintonPairModel.requireText(matchEntry.winningPairId, `${this.matchId} winning pair ID`);
    this.winnerDestination = new BadmintonDestinationModel(matchEntry.winnerDestination);
    this.loserDestination = new BadmintonDestinationModel(matchEntry.loserDestination);
    Object.freeze(this);
  }
}

class BadmintonTournamentRepository {
  constructor(pairEntries, matchEntries) {
    if (!Array.isArray(pairEntries) || pairEntries.length === 0) {
      throw new Error("At least one badminton pair entry is required.");
    }

    if (!Array.isArray(matchEntries) || matchEntries.length === 0) {
      throw new Error("At least one badminton match entry is required.");
    }

    this.badmintonPairs = Object.freeze(pairEntries.map((pairEntry) => new BadmintonPairModel(pairEntry)));
    this.badmintonMatches = Object.freeze(matchEntries.map((matchEntry) => new BadmintonMatchModel(matchEntry)));
  }

  getRegisteredPairs() {
    return this.badmintonPairs;
  }

  getScheduledMatches() {
    return this.badmintonMatches;
  }
}

class BadmintonTournamentScheduleService {
  constructor(badmintonTournamentRepository, activeBadmintonMatchIds) {
    if (!(badmintonTournamentRepository instanceof BadmintonTournamentRepository)) {
      throw new Error("A badminton tournament repository is required.");
    }

    if (!Array.isArray(activeBadmintonMatchIds) || activeBadmintonMatchIds.length !== 2) {
      throw new Error("Exactly two active badminton match IDs are required for the two courts.");
    }

    this.badmintonTournamentRepository = badmintonTournamentRepository;
    this.activeBadmintonMatchIds = Object.freeze(activeBadmintonMatchIds.map((matchId) => (
      BadmintonPairModel.requireText(matchId, "active match ID")
    )));

    if (new Set(this.activeBadmintonMatchIds).size !== this.activeBadmintonMatchIds.length) {
      throw new Error("Active badminton match IDs must be unique.");
    }
  }

  buildTournamentSchedule() {
    const registeredPairs = this.badmintonTournamentRepository.getRegisteredPairs();
    const scheduledMatches = this.badmintonTournamentRepository.getScheduledMatches();
    const registeredPairById = this.createUniqueMap(registeredPairs, "pairId", "pair");
    const scheduledMatchById = this.createUniqueMap(scheduledMatches, "matchId", "match");
    const resolvedParticipantsByMatchId = new Map();

    const scheduleRows = scheduledMatches.map((scheduledMatch, matchIndex) => {
      const teamOne = this.resolveParticipant(
        scheduledMatch.teamOneSource,
        matchIndex,
        registeredPairById,
        scheduledMatchById,
        resolvedParticipantsByMatchId
      );
      const teamTwo = this.resolveParticipant(
        scheduledMatch.teamTwoSource,
        matchIndex,
        registeredPairById,
        scheduledMatchById,
        resolvedParticipantsByMatchId
      );
      const resolvedParticipants = Object.freeze([teamOne, teamTwo]);

      resolvedParticipantsByMatchId.set(scheduledMatch.matchId, resolvedParticipants);
      const matchOutcome = this.resolveMatchOutcome(scheduledMatch, resolvedParticipants, registeredPairById);

      return Object.freeze({
        setNumber: scheduledMatch.setNumber,
        courtLabel: scheduledMatch.courtLabel,
        matchId: scheduledMatch.matchId,
        teamOneLabel: teamOne.displayLabel,
        teamOnePlayerNames: teamOne.playerNames,
        teamTwoLabel: teamTwo.displayLabel,
        teamTwoPlayerNames: teamTwo.playerNames,
        winnerLabel: matchOutcome.winnerLabel,
        loserLabel: matchOutcome.loserLabel,
        winnerDestination: scheduledMatch.winnerDestination,
        loserDestination: scheduledMatch.loserDestination
      });
    });

    const activeMatches = this.activeBadmintonMatchIds.map((activeMatchId) => {
      const activeMatch = scheduleRows.find((scheduleRow) => scheduleRow.matchId === activeMatchId);

      if (!activeMatch) {
        throw new Error(`Active badminton match ${activeMatchId} does not exist.`);
      }

      if (activeMatch.teamOnePlayerNames.length !== 2 || activeMatch.teamTwoPlayerNames.length !== 2) {
        throw new Error(`Active badminton match ${activeMatchId} cannot start until both pairs are resolved.`);
      }

      return activeMatch;
    });
    const activeCourtLabels = new Set(activeMatches.map((activeMatch) => activeMatch.courtLabel));

    if (activeCourtLabels.size !== activeMatches.length) {
      throw new Error("The two active badminton matches must use different courts.");
    }

    const inactiveMatches = scheduleRows.filter((scheduleRow) => (
      !this.activeBadmintonMatchIds.includes(scheduleRow.matchId)
    ));

    return Object.freeze({
      activeMatches: Object.freeze(activeMatches),
      inactiveMatches: Object.freeze(inactiveMatches)
    });
  }

  createUniqueMap(entries, identifierProperty, entryLabel) {
    const entryByIdentifier = new Map();

    entries.forEach((entry) => {
      const entryIdentifier = entry[identifierProperty];

      if (entryByIdentifier.has(entryIdentifier)) {
        throw new Error(`Duplicate badminton ${entryLabel} identifier: ${entryIdentifier}.`);
      }

      entryByIdentifier.set(entryIdentifier, entry);
    });

    return entryByIdentifier;
  }

  resolveParticipant(participantSource, currentMatchIndex, registeredPairById, scheduledMatchById, resolvedParticipantsByMatchId) {
    if (participantSource.pairId !== null) {
      const registeredPair = registeredPairById.get(participantSource.pairId);

      if (!registeredPair) {
        throw new Error(`Badminton pair ${participantSource.pairId} is not registered.`);
      }

      return Object.freeze({
        pairId: registeredPair.pairId,
        displayLabel: registeredPair.displayLabel,
        playerNames: registeredPair.playerNames
      });
    }

    const proceedingMatch = scheduledMatchById.get(participantSource.proceedingMatchId);

    if (!proceedingMatch) {
      throw new Error(`Proceeding badminton match ${participantSource.proceedingMatchId} does not exist.`);
    }

    const proceedingMatchIndex = this.badmintonTournamentRepository.getScheduledMatches().indexOf(proceedingMatch);

    if (proceedingMatchIndex >= currentMatchIndex) {
      throw new Error(`Proceeding match ${proceedingMatch.matchId} must be scheduled before the match that uses its outcome.`);
    }

    if (proceedingMatch.winningPairId === null) {
      const outcomeLabel = participantSource.proceedingOutcome === "winner" ? "Winner" : "Loser";
      return Object.freeze({
        pairId: null,
        displayLabel: `${outcomeLabel} of ${proceedingMatch.matchId}`,
        playerNames: Object.freeze([])
      });
    }

    const proceedingParticipants = resolvedParticipantsByMatchId.get(proceedingMatch.matchId);

    if (!proceedingParticipants) {
      throw new Error(`Participants for proceeding match ${proceedingMatch.matchId} have not been resolved.`);
    }

    const proceedingLoser = proceedingParticipants.find((participant) => participant.pairId !== proceedingMatch.winningPairId);
    const resolvedPairId = participantSource.proceedingOutcome === "winner"
      ? proceedingMatch.winningPairId
      : proceedingLoser?.pairId;

    if (!resolvedPairId) {
      throw new Error(`The ${participantSource.proceedingOutcome} of ${proceedingMatch.matchId} cannot be resolved.`);
    }

    const resolvedPair = registeredPairById.get(resolvedPairId);

    if (!resolvedPair) {
      throw new Error(`Resolved badminton pair ${resolvedPairId} is not registered.`);
    }

    return Object.freeze({
      pairId: resolvedPair.pairId,
      displayLabel: resolvedPair.displayLabel,
      playerNames: resolvedPair.playerNames
    });
  }

  resolveMatchOutcome(scheduledMatch, resolvedParticipants, registeredPairById) {
    if (scheduledMatch.winningPairId === null) {
      return Object.freeze({ winnerLabel: PENDING_RESULT_LABEL, loserLabel: PENDING_RESULT_LABEL });
    }

    const winningParticipant = resolvedParticipants.find((participant) => participant.pairId === scheduledMatch.winningPairId);
    const losingParticipant = resolvedParticipants.find((participant) => (
      participant.pairId !== null && participant.pairId !== scheduledMatch.winningPairId
    ));

    if (!winningParticipant || !losingParticipant) {
      throw new Error(`${scheduledMatch.matchId} winning pair must be one of its two resolved participants.`);
    }

    const winningPair = registeredPairById.get(winningParticipant.pairId);
    const losingPair = registeredPairById.get(losingParticipant.pairId);

    if (!winningPair || !losingPair) {
      throw new Error(`${scheduledMatch.matchId} contains an unregistered result pair.`);
    }

    return Object.freeze({ winnerLabel: winningPair.displayLabel, loserLabel: losingPair.displayLabel });
  }
}

class BadmintonTournamentScheduleView {
  constructor() {
    this.badmintonBracketBoard = document.querySelector("#badmintonBracketBoard");
    this.activeMatchGrid = document.querySelector("#activeMatchGrid");
    this.inactiveMatchCount = document.querySelector("#inactiveMatchCount");

    if (!this.badmintonBracketBoard || !this.activeMatchGrid || !this.inactiveMatchCount) {
      throw new Error("Required badminton tournament schedule elements are missing.");
    }
  }

  renderTournamentSchedule(tournamentSchedule) {
    if (
      typeof tournamentSchedule !== "object" ||
      tournamentSchedule === null ||
      !Array.isArray(tournamentSchedule.activeMatches) ||
      tournamentSchedule.activeMatches.length !== 2 ||
      !Array.isArray(tournamentSchedule.inactiveMatches)
    ) {
      throw new Error("A tournament schedule with two active matches and an inactive match list is required.");
    }

    const activeMatchFragment = document.createDocumentFragment();
    tournamentSchedule.activeMatches.forEach((activeMatch) => (
      activeMatchFragment.append(this.createMatchCard(activeMatch, true))
    ));
    this.activeMatchGrid.replaceChildren(activeMatchFragment);
    this.inactiveMatchCount.textContent = `${tournamentSchedule.inactiveMatches.length} matches`;

    const bracketFragment = document.createDocumentFragment();
    const matchesBySetNumber = tournamentSchedule.inactiveMatches.reduce((setMatches, scheduleRow) => {
      if (!setMatches.has(scheduleRow.setNumber)) {
        setMatches.set(scheduleRow.setNumber, []);
      }

      setMatches.get(scheduleRow.setNumber).push(scheduleRow);
      return setMatches;
    }, new Map());

    matchesBySetNumber.forEach((setMatches, setNumber) => {
      const setColumn = document.createElement("section");
      setColumn.className = "bracketSetColumn";
      setColumn.setAttribute("aria-labelledby", `badmintonSet${setNumber}Heading`);

      const setHeader = document.createElement("header");
      setHeader.className = "bracketSetHeader";
      const setStepLabel = document.createElement("span");
      setStepLabel.textContent = String(setNumber).padStart(2, "0");
      const setHeading = document.createElement("h3");
      setHeading.id = `badmintonSet${setNumber}Heading`;
      setHeading.textContent = `Set ${setNumber}`;
      setHeader.append(setStepLabel, setHeading);

      const setMatchList = document.createElement("div");
      setMatchList.className = "bracketMatchList";
      setMatches.forEach((scheduleRow) => setMatchList.append(this.createMatchCard(scheduleRow, false)));
      setColumn.append(setHeader, setMatchList);
      bracketFragment.append(setColumn);
    });

    this.badmintonBracketBoard.replaceChildren(bracketFragment);
  }

  createMatchCard(scheduleRow, matchIsActive) {
    const matchCard = document.createElement("article");
    matchCard.className = "bracketMatchCard";
    matchCard.classList.toggle("isFinalMatch", scheduleRow.matchId === "Finals");
    matchCard.classList.toggle("isActiveMatch", matchIsActive);

    const matchCardHeader = document.createElement("header");
    const matchIdentifier = document.createElement("strong");
    matchIdentifier.textContent = scheduleRow.matchId;
    const courtLabel = document.createElement("span");
    courtLabel.textContent = scheduleRow.courtLabel;
    matchCardHeader.append(matchIdentifier, courtLabel);

    const participantList = document.createElement("div");
    participantList.className = "bracketParticipantList";
    const teamOneSlot = this.createParticipantSlot(
      "Team 1",
      scheduleRow.teamOneLabel,
      scheduleRow.teamOnePlayerNames,
      matchIsActive,
      "isTeamOne"
    );
    const teamTwoSlot = this.createParticipantSlot(
      "Team 2",
      scheduleRow.teamTwoLabel,
      scheduleRow.teamTwoPlayerNames,
      matchIsActive,
      "isTeamTwo"
    );

    if (matchIsActive) {
      participantList.append(teamOneSlot, this.createVersusMarker(), teamTwoSlot);
    } else {
      participantList.append(teamOneSlot, teamTwoSlot);
    }

    const outcomeList = document.createElement("div");
    outcomeList.className = "bracketOutcomeList";
    outcomeList.append(
      this.createOutcomePath("Winner", scheduleRow.winnerLabel, scheduleRow.winnerDestination),
      this.createOutcomePath("Loser", scheduleRow.loserLabel, scheduleRow.loserDestination)
    );

    matchCard.append(matchCardHeader, participantList, outcomeList);
    return matchCard;
  }

  createParticipantSlot(teamLabel, participantLabel, playerNames, matchIsActive, teamPositionClass) {
    const participantSlot = document.createElement("div");
    participantSlot.className = `bracketParticipantSlot ${teamPositionClass}`;
    const teamNumber = document.createElement("span");
    teamNumber.textContent = teamLabel;
    const participantName = document.createElement("strong");
    participantName.textContent = participantLabel;
    participantSlot.append(teamNumber, participantName);

    if (playerNames.length > 0) {
      const playerAvatarList = document.createElement("div");
      playerAvatarList.className = "playerAvatarList";
      playerNames.forEach((playerName) => (
        playerAvatarList.append(this.createPlayerAvatar(playerName, matchIsActive))
      ));
      participantSlot.append(playerAvatarList);
    }

    return participantSlot;
  }

  createVersusMarker() {
    const versusMarker = document.createElement("div");
    versusMarker.className = "battleVersusMarker";
    versusMarker.setAttribute("aria-label", "versus");
    const versusText = document.createElement("span");
    versusText.setAttribute("aria-hidden", "true");
    versusText.textContent = "VS";
    versusMarker.append(versusText);
    return versusMarker;
  }

  createPlayerAvatar(playerName, matchIsActive) {
    const playerProfile = document.createElement("figure");
    const playerAvatar = document.createElement("img");
    const playerCaption = document.createElement("figcaption");
    const avatarUrl = new URL(DICEBEAR_OPEN_PEEPS_AVATAR_ENDPOINT);

    avatarUrl.searchParams.set("seed", playerName);
    playerAvatar.src = avatarUrl.href;
    playerAvatar.alt = `${playerName} avatar`;
    playerAvatar.width = 64;
    playerAvatar.height = 64;
    playerAvatar.loading = matchIsActive ? "eager" : "lazy";
    playerAvatar.decoding = "async";
    playerCaption.textContent = playerName;
    playerProfile.append(playerAvatar, playerCaption);
    return playerProfile;
  }

  createOutcomePath(outcomeLabel, resultLabel, destination) {
    const outcomePath = document.createElement("div");
    outcomePath.className = "bracketOutcomePath";
    outcomePath.classList.add(`is${destination.destinationType[0].toUpperCase()}${destination.destinationType.slice(1)}`);

    const outcomeSummary = document.createElement("span");
    outcomeSummary.textContent = outcomeLabel;
    const resultName = document.createElement("strong");
    resultName.textContent = resultLabel;
    resultName.classList.toggle("isPending", resultLabel === PENDING_RESULT_LABEL);

    const destinationLabel = document.createElement("b");
    destinationLabel.textContent = destination.destinationLabel;

    if (destination.destinationType === "match") {
      destinationLabel.textContent = `→ ${destination.destinationLabel}`;
    }

    if (destination.destinationType === "eliminated") {
      destinationLabel.textContent = `✕ ${destination.destinationLabel}`;
    }

    outcomePath.append(outcomeSummary, resultName, destinationLabel);
    return outcomePath;
  }
}

class BadmintonTournamentScheduleController {
  constructor(badmintonTournamentScheduleService, badmintonTournamentScheduleView) {
    this.badmintonTournamentScheduleService = badmintonTournamentScheduleService;
    this.badmintonTournamentScheduleView = badmintonTournamentScheduleView;
  }

  displayTournamentSchedule() {
    this.badmintonTournamentScheduleView.renderTournamentSchedule(
      this.badmintonTournamentScheduleService.buildTournamentSchedule()
    );
  }
}

const badmintonTournamentScheduleController = new BadmintonTournamentScheduleController(
  new BadmintonTournamentScheduleService(
    new BadmintonTournamentRepository(BADMINTON_PAIR_ENTRIES, BADMINTON_MATCH_ENTRIES),
    ACTIVE_BADMINTON_MATCH_IDS
  ),
  new BadmintonTournamentScheduleView()
);

badmintonTournamentScheduleController.displayTournamentSchedule();
