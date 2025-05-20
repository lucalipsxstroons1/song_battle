import uuid
import random

REQUIRED_PLAYERS: int = 2

class Cur_Song():
    def __init__(self, id, submitter):
        self.submitter = submitter
        self.id = id
        self.votes = set()

    votes: set[uuid.UUID]
    id: str
    submitter: uuid.UUID

status: int = 0  # 1 = Runnging, 0 = Waiting
submitted_songs: list[Cur_Song] = []
cur_songs: list[Cur_Song] = []
ready_players: set[uuid.UUID] = set()
players: set[uuid.UUID] = set()

def start():
    global cur_songs
    global submitted_songs
    global status

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

            return len(cur_song.votes)

def check_votes() -> bool:
    for player in players:
        if not check_player_voted(player):
            return False

    return True

def check_player_voted(playerid: uuid.UUID) -> bool:
    return not any(playerid in cur_song.votes for cur_song in cur_songs)