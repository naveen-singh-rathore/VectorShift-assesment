from main import is_dag


def nodes(*ids):
    return [{"id": i} for i in ids]


def edges(*pairs):
    return [{"source": s, "target": t} for s, t in pairs]


def test_acyclic_is_dag():
    assert is_dag(nodes("a", "b", "c"), edges(("a", "b"), ("b", "c"))) is True


def test_cycle_is_not_dag():
    assert is_dag(nodes("a", "b", "c"), edges(("a", "b"), ("b", "c"), ("c", "a"))) is False


def test_empty_is_dag():
    assert is_dag([], []) is True


def test_self_loop_is_not_dag():
    assert is_dag(nodes("a"), edges(("a", "a"))) is False


def test_dangling_edges_ignored():
    assert is_dag(nodes("a", "b"), edges(("a", "b"), ("x", "y"))) is True
