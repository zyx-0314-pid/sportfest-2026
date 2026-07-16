(function initializeDoublesTournamentBracket(globalWindow) {
  const PARTICIPANT_OUTCOMES = Object.freeze(["winner", "loser"]);
  const DESTINATION_TYPES = Object.freeze(["match", "placement", "eliminated"]);
  const PENDING_RESULT_LABEL = "Pending";

  class DoublesPairModel {
    constructor({ pairId, pairLabel, playerNames }, tournamentLabel) {
      this.tournamentLabel = DoublesPairModel.requireText(tournamentLabel, "tournament label");
      this.pairId = DoublesPairModel.requireText(pairId, `${this.tournamentLabel} pair ID`);
      this.pairLabel = DoublesPairModel.requireText(pairLabel, `${this.tournamentLabel} pair label`);

      if (!Array.isArray(playerNames) || playerNames.length !== 2) {
        throw new Error(`${this.pairLabel} must contain exactly two player names.`);
      }

      this.playerNames = Object.freeze(playerNames.map((playerName) => (
        DoublesPairModel.requireText(playerName, `${this.pairLabel} player name`)
      )));
      Object.freeze(this);
    }

    static requireText(textValue, fieldLabel) {
      if (typeof textValue !== "string" || textValue.trim() === "") {
        throw new Error(`${fieldLabel} is required.`);
      }

      return textValue.trim();
    }

    get displayLabel() {
      return `${this.pairLabel} — ${this.playerNames.join(" / ")}`;
    }
  }

  class DoublesParticipantSourceModel {
    constructor({ pairId, proceedingMatchId, proceedingOutcome }, tournamentLabel) {
      const hasPairId = typeof pairId === "string" && pairId.trim() !== "";
      const hasProceedingMatch = typeof proceedingMatchId === "string" && proceedingMatchId.trim() !== "";

      if (hasPairId === hasProceedingMatch) {
        throw new Error(`Each ${tournamentLabel} participant source must contain either one pair ID or one proceeding match.`);
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

  class DoublesDestinationModel {
    constructor({ destinationType, destinationLabel }, tournamentLabel) {
      if (!DESTINATION_TYPES.includes(destinationType)) {
        throw new Error(`${tournamentLabel} destination type ${destinationType || "missing"} is invalid.`);
      }

      this.destinationType = destinationType;
      this.destinationLabel = DoublesPairModel.requireText(destinationLabel, `${tournamentLabel} destination label`);
      Object.freeze(this);
    }
  }

  class DoublesMatchModel {
    constructor(matchEntry, tournamentLabel) {
      if (!Number.isInteger(matchEntry.setNumber) || matchEntry.setNumber < 1) {
        throw new Error(`${tournamentLabel} set number must be a positive integer.`);
      }

      this.setNumber = matchEntry.setNumber;
      this.courtLabel = DoublesPairModel.requireText(matchEntry.courtLabel, `${tournamentLabel} court label`);
      this.matchId = DoublesPairModel.requireText(matchEntry.matchId, `${tournamentLabel} match ID`);
      this.teamOneSource = new DoublesParticipantSourceModel(matchEntry.teamOneSource, tournamentLabel);
      this.teamTwoSource = new DoublesParticipantSourceModel(matchEntry.teamTwoSource, tournamentLabel);
      this.winningPairId = matchEntry.winningPairId === null
        ? null
        : DoublesPairModel.requireText(matchEntry.winningPairId, `${this.matchId} winning pair ID`);
      this.winnerDestination = new DoublesDestinationModel(matchEntry.winnerDestination, tournamentLabel);
      this.loserDestination = new DoublesDestinationModel(matchEntry.loserDestination, tournamentLabel);
      Object.freeze(this);
    }
  }

  class DoublesTournamentRepository {
    constructor(tournamentLabel, pairEntries, matchEntries) {
      this.tournamentLabel = DoublesPairModel.requireText(tournamentLabel, "Tournament label");

      if (!Array.isArray(pairEntries) || pairEntries.length === 0) {
        throw new Error(`At least one ${this.tournamentLabel} pair entry is required.`);
      }

      if (!Array.isArray(matchEntries) || matchEntries.length === 0) {
        throw new Error(`At least one ${this.tournamentLabel} match entry is required.`);
      }

      this.registeredPairs = Object.freeze(pairEntries.map((pairEntry) => (
        new DoublesPairModel(pairEntry, this.tournamentLabel)
      )));
      this.scheduledMatches = Object.freeze(matchEntries.map((matchEntry) => (
        new DoublesMatchModel(matchEntry, this.tournamentLabel)
      )));
    }

    getTournamentLabel() {
      return this.tournamentLabel;
    }

    getRegisteredPairs() {
      return this.registeredPairs;
    }

    getScheduledMatches() {
      return this.scheduledMatches;
    }
  }

  class DoublesTournamentScheduleService {
    constructor(doublesTournamentRepository, activeMatchIds) {
      if (!(doublesTournamentRepository instanceof DoublesTournamentRepository)) {
        throw new Error("A doubles tournament repository is required.");
      }

      if (!Array.isArray(activeMatchIds) || activeMatchIds.length !== 2) {
        throw new Error("Exactly two active match IDs are required for the two courts.");
      }

      this.doublesTournamentRepository = doublesTournamentRepository;
      this.tournamentLabel = doublesTournamentRepository.getTournamentLabel();
      this.activeMatchIds = Object.freeze(activeMatchIds.map((matchId) => (
        DoublesPairModel.requireText(matchId, `${this.tournamentLabel} active match ID`)
      )));

      if (new Set(this.activeMatchIds).size !== this.activeMatchIds.length) {
        throw new Error(`${this.tournamentLabel} active match IDs must be unique.`);
      }
    }

    buildTournamentSchedule() {
      const registeredPairs = this.doublesTournamentRepository.getRegisteredPairs();
      const scheduledMatches = this.doublesTournamentRepository.getScheduledMatches();
      const registeredPairById = this.createUniqueMap(registeredPairs, "pairId", "pair");
      const scheduledMatchById = this.createUniqueMap(scheduledMatches, "matchId", "match");
      const scheduledMatchIndexById = new Map(scheduledMatches.map((scheduledMatch, matchIndex) => (
        [scheduledMatch.matchId, matchIndex]
      )));
      const resolvedParticipantsByMatchId = new Map();

      const scheduleRows = scheduledMatches.map((scheduledMatch, matchIndex) => {
        const teamOne = this.resolveParticipant(
          scheduledMatch.teamOneSource,
          matchIndex,
          registeredPairById,
          scheduledMatchById,
          scheduledMatchIndexById,
          resolvedParticipantsByMatchId
        );
        const teamTwo = this.resolveParticipant(
          scheduledMatch.teamTwoSource,
          matchIndex,
          registeredPairById,
          scheduledMatchById,
          scheduledMatchIndexById,
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

      const activeMatches = this.activeMatchIds.map((activeMatchId) => {
        const activeMatch = scheduleRows.find((scheduleRow) => scheduleRow.matchId === activeMatchId);

        if (!activeMatch) {
          throw new Error(`Active ${this.tournamentLabel} match ${activeMatchId} does not exist.`);
        }

        if (activeMatch.teamOnePlayerNames.length !== 2 || activeMatch.teamTwoPlayerNames.length !== 2) {
          throw new Error(`Active ${this.tournamentLabel} match ${activeMatchId} cannot start until both pairs are resolved.`);
        }

        return activeMatch;
      });
      const activeCourtLabels = new Set(activeMatches.map((activeMatch) => activeMatch.courtLabel));

      if (activeCourtLabels.size !== activeMatches.length) {
        throw new Error(`The two active ${this.tournamentLabel} matches must use different courts.`);
      }

      return Object.freeze({
        activeMatches: Object.freeze(activeMatches),
        inactiveMatches: Object.freeze(scheduleRows.filter((scheduleRow) => (
          !this.activeMatchIds.includes(scheduleRow.matchId)
        )))
      });
    }

    createUniqueMap(entries, identifierProperty, entryLabel) {
      const entryByIdentifier = new Map();

      entries.forEach((entry) => {
        const entryIdentifier = entry[identifierProperty];

        if (entryByIdentifier.has(entryIdentifier)) {
          throw new Error(`Duplicate ${this.tournamentLabel} ${entryLabel} identifier: ${entryIdentifier}.`);
        }

        entryByIdentifier.set(entryIdentifier, entry);
      });

      return entryByIdentifier;
    }

    resolveParticipant(
      participantSource,
      currentMatchIndex,
      registeredPairById,
      scheduledMatchById,
      scheduledMatchIndexById,
      resolvedParticipantsByMatchId
    ) {
      if (participantSource.pairId !== null) {
        const registeredPair = registeredPairById.get(participantSource.pairId);

        if (!registeredPair) {
          throw new Error(`${this.tournamentLabel} pair ${participantSource.pairId} is not registered.`);
        }

        return this.createResolvedParticipant(registeredPair);
      }

      const proceedingMatch = scheduledMatchById.get(participantSource.proceedingMatchId);

      if (!proceedingMatch) {
        throw new Error(`Proceeding ${this.tournamentLabel} match ${participantSource.proceedingMatchId} does not exist.`);
      }

      if (scheduledMatchIndexById.get(proceedingMatch.matchId) >= currentMatchIndex) {
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

      const proceedingLoser = proceedingParticipants.find((participant) => (
        participant.pairId !== proceedingMatch.winningPairId
      ));
      const resolvedPairId = participantSource.proceedingOutcome === "winner"
        ? proceedingMatch.winningPairId
        : proceedingLoser?.pairId;

      if (!resolvedPairId) {
        throw new Error(`The ${participantSource.proceedingOutcome} of ${proceedingMatch.matchId} cannot be resolved.`);
      }

      const resolvedPair = registeredPairById.get(resolvedPairId);

      if (!resolvedPair) {
        throw new Error(`Resolved ${this.tournamentLabel} pair ${resolvedPairId} is not registered.`);
      }

      return this.createResolvedParticipant(resolvedPair);
    }

    createResolvedParticipant(registeredPair) {
      return Object.freeze({
        pairId: registeredPair.pairId,
        displayLabel: registeredPair.displayLabel,
        playerNames: registeredPair.playerNames
      });
    }

    resolveMatchOutcome(scheduledMatch, resolvedParticipants, registeredPairById) {
      if (scheduledMatch.winningPairId === null) {
        return Object.freeze({ winnerLabel: PENDING_RESULT_LABEL, loserLabel: PENDING_RESULT_LABEL });
      }

      const winningParticipant = resolvedParticipants.find((participant) => (
        participant.pairId === scheduledMatch.winningPairId
      ));
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

  class DoublesTournamentScheduleView {
    constructor(avatarEndpoint) {
      this.avatarEndpoint = DoublesPairModel.requireText(avatarEndpoint, "Avatar endpoint");
      this.bracketBoard = document.querySelector("#tournamentBracketBoard");
      this.activeMatchGrid = document.querySelector("#activeMatchGrid");
      this.inactiveMatchCount = document.querySelector("#inactiveMatchCount");

      if (!this.bracketBoard || !this.activeMatchGrid || !this.inactiveMatchCount) {
        throw new Error("Required doubles tournament schedule elements are missing.");
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

      const matchesBySetNumber = tournamentSchedule.inactiveMatches.reduce((setMatches, scheduleRow) => {
        if (!setMatches.has(scheduleRow.setNumber)) {
          setMatches.set(scheduleRow.setNumber, []);
        }

        setMatches.get(scheduleRow.setNumber).push(scheduleRow);
        return setMatches;
      }, new Map());
      const bracketFragment = document.createDocumentFragment();

      matchesBySetNumber.forEach((setMatches, setNumber) => {
        const setColumn = document.createElement("section");
        setColumn.className = "bracketSetColumn";
        setColumn.setAttribute("aria-labelledby", `tournamentSet${setNumber}Heading`);
        const setHeader = document.createElement("header");
        setHeader.className = "bracketSetHeader";
        const setStepLabel = document.createElement("span");
        setStepLabel.textContent = String(setNumber).padStart(2, "0");
        const setHeading = document.createElement("h3");
        setHeading.id = `tournamentSet${setNumber}Heading`;
        setHeading.textContent = `Set ${setNumber}`;
        setHeader.append(setStepLabel, setHeading);
        const setMatchList = document.createElement("div");
        setMatchList.className = "bracketMatchList";
        setMatches.forEach((scheduleRow) => setMatchList.append(this.createMatchCard(scheduleRow, false)));
        setColumn.append(setHeader, setMatchList);
        bracketFragment.append(setColumn);
      });

      this.bracketBoard.replaceChildren(bracketFragment);
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
      const avatarUrl = new URL(this.avatarEndpoint);

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

  class DoublesTournamentScheduleController {
    constructor(doublesTournamentScheduleService, doublesTournamentScheduleView) {
      this.doublesTournamentScheduleService = doublesTournamentScheduleService;
      this.doublesTournamentScheduleView = doublesTournamentScheduleView;
    }

    displayTournamentSchedule() {
      this.doublesTournamentScheduleView.renderTournamentSchedule(
        this.doublesTournamentScheduleService.buildTournamentSchedule()
      );
    }
  }

  globalWindow.DoublesTournamentBracket = Object.freeze({
    DoublesTournamentRepository,
    DoublesTournamentScheduleService,
    DoublesTournamentScheduleView,
    DoublesTournamentScheduleController
  });
}(window));
