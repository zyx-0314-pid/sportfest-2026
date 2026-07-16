const navigationToggle = document.querySelector(".navigationToggle");
const primaryNavigation = document.querySelector(".primaryNavigation");
const BADMINTON_TOURNAMENT_LABEL = "Badminton";
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
    setNumber: 1, courtLabel: "Court 1", matchId: "M1",
    teamOneSource: { pairId: "pairA" }, teamTwoSource: { pairId: "pairB" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M4" },
    loserDestination: { destinationType: "match", destinationLabel: "M6" }
  },
  {
    setNumber: 1, courtLabel: "Court 2", matchId: "M2",
    teamOneSource: { pairId: "pairC" }, teamTwoSource: { pairId: "pairD" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M5" },
    loserDestination: { destinationType: "match", destinationLabel: "M6" }
  },
  {
    setNumber: 2, courtLabel: "Court 1", matchId: "M3",
    teamOneSource: { pairId: "pairE" }, teamTwoSource: { pairId: "pairF" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M5" },
    loserDestination: { destinationType: "match", destinationLabel: "M8" }
  },
  {
    setNumber: 2, courtLabel: "Court 2", matchId: "M4",
    teamOneSource: { pairId: "pairG" },
    teamTwoSource: { proceedingMatchId: "M1", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M7" },
    loserDestination: { destinationType: "match", destinationLabel: "M8" }
  },
  {
    setNumber: 3, courtLabel: "Court 1", matchId: "M5",
    teamOneSource: { proceedingMatchId: "M2", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M3", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M7" },
    loserDestination: { destinationType: "match", destinationLabel: "M9" }
  },
  {
    setNumber: 3, courtLabel: "Court 2", matchId: "M6",
    teamOneSource: { proceedingMatchId: "M1", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M2", proceedingOutcome: "loser" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M9" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 4, courtLabel: "Court 1", matchId: "M7",
    teamOneSource: { proceedingMatchId: "M4", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M5", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "Finals" },
    loserDestination: { destinationType: "match", destinationLabel: "M10" }
  },
  {
    setNumber: 4, courtLabel: "Court 2", matchId: "M8",
    teamOneSource: { proceedingMatchId: "M3", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M4", proceedingOutcome: "loser" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M10" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 5, courtLabel: "Court 1", matchId: "M9",
    teamOneSource: { proceedingMatchId: "M5", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M6", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M11" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 5, courtLabel: "Court 2", matchId: "M10",
    teamOneSource: { proceedingMatchId: "M7", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M8", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M11" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 6, courtLabel: "Court 1", matchId: "M11",
    teamOneSource: { proceedingMatchId: "M9", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M10", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "Finals" },
    loserDestination: { destinationType: "placement", destinationLabel: "3rd Place Winner" }
  },
  {
    setNumber: 6, courtLabel: "Court 2", matchId: "Finals",
    teamOneSource: { proceedingMatchId: "M7", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M11", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "placement", destinationLabel: "Champion" },
    loserDestination: { destinationType: "placement", destinationLabel: "2nd Place Winner" }
  }
]);

if (!navigationToggle || !primaryNavigation) {
  throw new Error("Required mobile navigation elements are missing.");
}

if (!window.DoublesTournamentBracket) {
  throw new Error("The shared doubles tournament bracket module is missing.");
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

const {
  DoublesTournamentRepository,
  DoublesTournamentScheduleService,
  DoublesTournamentScheduleView,
  DoublesTournamentScheduleController
} = window.DoublesTournamentBracket;

const badmintonTournamentScheduleController = new DoublesTournamentScheduleController(
  new DoublesTournamentScheduleService(
    new DoublesTournamentRepository(
      BADMINTON_TOURNAMENT_LABEL,
      BADMINTON_PAIR_ENTRIES,
      BADMINTON_MATCH_ENTRIES
    ),
    ACTIVE_BADMINTON_MATCH_IDS
  ),
  new DoublesTournamentScheduleView(DICEBEAR_OPEN_PEEPS_AVATAR_ENDPOINT)
);

badmintonTournamentScheduleController.displayTournamentSchedule();
