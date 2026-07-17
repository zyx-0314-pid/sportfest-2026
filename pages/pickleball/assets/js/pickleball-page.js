const navigationToggle = document.querySelector(".navigationToggle");
const primaryNavigation = document.querySelector(".primaryNavigation");
const PICKLEBALL_TOURNAMENT_LABEL = "Pickleball";
const DICEBEAR_OPEN_PEEPS_AVATAR_ENDPOINT = "https://api.dicebear.com/10.x/open-peeps/svg";
const ACTIVE_PICKLEBALL_MATCH_IDS = Object.freeze(["M1", "M2"]);

const PICKLEBALL_PAIR_ENTRIES = Object.freeze([
  { pairId: "pairA", pairLabel: "Pair A", playerNames: ["Abby", "Ana"] },
  { pairId: "pairB", pairLabel: "Pair B", playerNames: ["Spencer", "Victor"] },
  { pairId: "pairC", pairLabel: "Pair C", playerNames: ["Gail", "Dexter"] },
  { pairId: "pairD", pairLabel: "Pair D", playerNames: ["Veron", "Arniel"] },
  { pairId: "pairE", pairLabel: "Pair E", playerNames: ["Alex", "Jomer"] },
  { pairId: "pairF", pairLabel: "Pair F", playerNames: ["Cassie", "JC"] },
  { pairId: "pairG", pairLabel: "Pair G", playerNames: ["Roland", "Carmen"] },
  { pairId: "pairH", pairLabel: "Pair H", playerNames: ["Denmark", "Claire"] }
]);

const PICKLEBALL_MATCH_ENTRIES = Object.freeze([
  {
    setNumber: 1, courtLabel: "Court 1", matchId: "M1",
    teamOneSource: { pairId: "pairA" }, teamTwoSource: { pairId: "pairB" }, winningPairId: "pairA",
    winnerDestination: { destinationType: "match", destinationLabel: "M5" },
    loserDestination: { destinationType: "match", destinationLabel: "M6" }
  },
  {
    setNumber: 1, courtLabel: "Court 2", matchId: "M2",
    teamOneSource: { pairId: "pairC" }, teamTwoSource: { pairId: "pairD" }, winningPairId: "pairC",
    winnerDestination: { destinationType: "match", destinationLabel: "M5" },
    loserDestination: { destinationType: "match", destinationLabel: "M6" }
  },
  {
    setNumber: 2, courtLabel: "Court 1", matchId: "M3",
    teamOneSource: { pairId: "pairE" }, teamTwoSource: { pairId: "pairF" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M7" },
    loserDestination: { destinationType: "match", destinationLabel: "M8" }
  },
  {
    setNumber: 2, courtLabel: "Court 2", matchId: "M4",
    teamOneSource: { pairId: "pairG" }, teamTwoSource: { pairId: "pairH" }, winningPairId: "pairG",
    winnerDestination: { destinationType: "match", destinationLabel: "M7" },
    loserDestination: { destinationType: "match", destinationLabel: "M8" }
  },
  {
    setNumber: 3, courtLabel: "Court 1", matchId: "M5",
    teamOneSource: { proceedingMatchId: "M1", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M2", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M11" },
    loserDestination: { destinationType: "match", destinationLabel: "M9" }
  },
  {
    setNumber: 3, courtLabel: "Court 2", matchId: "M6",
    teamOneSource: { proceedingMatchId: "M1", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M2", proceedingOutcome: "loser" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M10" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 4, courtLabel: "Court 1", matchId: "M7",
    teamOneSource: { proceedingMatchId: "M3", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M4", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M11" },
    loserDestination: { destinationType: "match", destinationLabel: "M10" }
  },
  {
    setNumber: 4, courtLabel: "Court 2", matchId: "M8",
    teamOneSource: { proceedingMatchId: "M3", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M4", proceedingOutcome: "loser" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M9" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 5, courtLabel: "Court 1", matchId: "M9",
    teamOneSource: { proceedingMatchId: "M5", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M8", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M12" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 5, courtLabel: "Court 2", matchId: "M10",
    teamOneSource: { proceedingMatchId: "M6", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M7", proceedingOutcome: "loser" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M12" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 6, courtLabel: "Court 1", matchId: "M11",
    teamOneSource: { proceedingMatchId: "M5", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M7", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "Finals" },
    loserDestination: { destinationType: "match", destinationLabel: "M13" }
  },
  {
    setNumber: 6, courtLabel: "Court 2", matchId: "M12",
    teamOneSource: { proceedingMatchId: "M9", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M10", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "M13" },
    loserDestination: { destinationType: "eliminated", destinationLabel: "Eliminated" }
  },
  {
    setNumber: 7, courtLabel: "Court 1", matchId: "M13",
    teamOneSource: { proceedingMatchId: "M11", proceedingOutcome: "loser" },
    teamTwoSource: { proceedingMatchId: "M12", proceedingOutcome: "winner" }, winningPairId: null,
    winnerDestination: { destinationType: "match", destinationLabel: "Finals" },
    loserDestination: { destinationType: "placement", destinationLabel: "3rd Place Winner" }
  },
  {
    setNumber: 7, courtLabel: "Court 2", matchId: "Finals",
    teamOneSource: { proceedingMatchId: "M11", proceedingOutcome: "winner" },
    teamTwoSource: { proceedingMatchId: "M13", proceedingOutcome: "winner" }, winningPairId: null,
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

const pickleballTournamentScheduleController = new DoublesTournamentScheduleController(
  new DoublesTournamentScheduleService(
    new DoublesTournamentRepository(
      PICKLEBALL_TOURNAMENT_LABEL,
      PICKLEBALL_PAIR_ENTRIES,
      PICKLEBALL_MATCH_ENTRIES
    ),
    ACTIVE_PICKLEBALL_MATCH_IDS
  ),
  new DoublesTournamentScheduleView(DICEBEAR_OPEN_PEEPS_AVATAR_ENDPOINT)
);

pickleballTournamentScheduleController.displayTournamentSchedule();
