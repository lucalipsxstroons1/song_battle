import uuid
import random

REQUIRED_PLAYERS: int = 2

status: int = 0  # 1 = Runnging, 0 = Waiting
submitted_songs: list[str] = []
cur_songs: list[str] = []
ready_players: set[uuid.UUID] = set()
players: set[uuid.UUID] = set()

class Cur_Song():
    def __init__(self, id, submitter):
        self.submitter = submitter
        self.id = id
        self.votes = set()

    votes: set[uuid.UUID]
    id: str
    submitter: uuid.UUID

def start():
    global cur_songs
    global submitted_songs
    global status

    assert status == 0

    status = 1
    random.shuffle(submitted_songs)
    cur_songs = [submitted_songs[0], submitted_songs[1]]

def vote(player: uuid.UUID, song: str):
    global cur_songs

    for cur_song in cur_songs:
        if cur_song.id == song:
            cur_song.votes.add(player)
            print(player, "voted for song:", cur_song.id)

            return len(cur_song.votes)