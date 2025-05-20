import uuid
import random

REQUIRED_PLAYERS: int = 4

class Cur_Song():
    def __init__(self, id, submitter):
        self.submitter = submitter
        self.id = id
        self.votes = set()

    votes: set[uuid.UUID]
    id: str
    submitter: uuid.UUID

status: int = 0  # 2 = Ending, 1 = Runnging, 0 = Waiting
round_num: int = 0
submitted_songs: list[Cur_Song] = []
cur_songs: list[Cur_Song] = []
qualified: list[Cur_Song] = []
ready_players: set[uuid.UUID] = set()
players: set[uuid.UUID] = set()
winner: Cur_Song

def submit(song: str) -> uuid.UUID:
    # UUID für Spieler erzeugen
    player_id = uuid.uuid4()

    # Song speichern
    submitted_songs.append(Cur_Song(song, player_id))
    players.add(player_id)

    print(f"Spieler {player_id} hat Song {song} eingereicht")

    return player_id

def ready(playerid: uuid.UUID) -> bool:
    ready_players.add(playerid)

    # Spiel starten wenn alle Spieler bereit & eingereicht haben
    if (
        len(ready_players) >= REQUIRED_PLAYERS and 
        len(ready_players) == len(players)
    ):
        start()
        return True

    return False

def start():
    global cur_songs, submitted_songs, status

    assert status == 0

    status = 1
    random.shuffle(submitted_songs)
    cur_songs = [submitted_songs[0], submitted_songs[1]]

def vote(player: uuid.UUID, song: str) -> int:
    global cur_songs

    for cur_song in cur_songs:
        if cur_song.id == song:
            cur_song.votes.add(player)
            print(player, "voted for song:", cur_song.id)

            if check_votes():
                print("All players have voted")
                next_stage()

            return len(cur_song.votes)

def check_votes() -> bool:
    for player in players:
        if not check_player_voted(player):
            return False

    return True

def check_player_voted(playerid: uuid.UUID) -> bool:
    return any(playerid in cur_song.votes for cur_song in cur_songs)

def next_stage():
    global cur_songs, round_num
    assert len(cur_songs) > 0

    winner = cur_songs[0]
    winner_votes = len(cur_songs[0].votes)
    cur_songs[0].votes.clear()

    for cur_song in cur_songs[1::]:
        if len(cur_song.votes) > winner_votes:
            winner = cur_song
            winner_votes = len(cur_song.votes)

        cur_song.votes.clear()

    print(f"Winner for round {round_num}:", winner)

    qualified.append(winner)

    for cur_song in submitted_songs[:]:
        if cur_song in cur_songs:
            print("Remove song:", cur_song.id)
            submitted_songs.remove(cur_song)

    if len(submitted_songs) < 2:
        end_stage()
        return

    random.shuffle(submitted_songs)
    cur_songs = [submitted_songs[0], submitted_songs[1]]
    round_num += 1

def end_stage():
    global status, winner, cur_songs, submitted_songs, round_num

    print(f"Round {round_num} has ended")

    print(len(qualified))
    if (len(qualified) == 1):
        status = 2
        winner = qualified[0]
        cur_songs = []
        return

    submitted_songs = qualified[:]
    qualified.clear()
    cur_songs = [submitted_songs[0], submitted_songs[1]]
    round_num += 1