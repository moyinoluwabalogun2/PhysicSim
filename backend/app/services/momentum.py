def round2(value: float) -> float:
    return round(value, 2)


def calculate_single_momentum(payload):
    momentum1 = payload.mass1 * payload.velocity1

    return {
        "mode": "momentum",
        "scenario": payload.scenario,
        "mass1": round2(payload.mass1),
        "velocity1": round2(payload.velocity1),
        "momentum1": round2(momentum1),
        "summary": (
            f"Momentum is the product of mass and velocity. "
            f"For this object, momentum = {round2(momentum1)} kg·m/s."
        )
    }


def calculate_collision(payload):
    m1 = payload.mass1
    m2 = payload.mass2
    u1 = payload.velocity1
    u2 = payload.velocity2

    initial_momentum = m1 * u1 + m2 * u2

    if payload.collisionType == "elastic":
        v1 = ((m1 - m2) / (m1 + m2)) * u1 + ((2 * m2) / (m1 + m2)) * u2
        v2 = ((2 * m1) / (m1 + m2)) * u1 + ((m2 - m1) / (m1 + m2)) * u2
    else:
        shared_v = initial_momentum / (m1 + m2)
        v1 = shared_v
        v2 = shared_v

    final_momentum = m1 * v1 + m2 * v2

    return {
        "mode": "collision",
        "scenario": payload.scenario,
        "collision_type": payload.collisionType,
        "initial_momentum": round2(initial_momentum),
        "final_momentum": round2(final_momentum),
        "final_velocity1": round2(v1),
        "final_velocity2": round2(v2),
        "summary": (
            f"During collision, total momentum is conserved. "
            f"Initial momentum = {round2(initial_momentum)} kg·m/s and "
            f"final momentum = {round2(final_momentum)} kg·m/s."
        )
    }


def calculate_recoil(payload):
    m1 = payload.mass1
    m2 = payload.mass2

    initial_momentum = 0.0

    if payload.scenario == "gun-recoil":
        v2 = 18.0
    elif payload.scenario == "cannon-recoil":
        v2 = 12.0
    else:
        v2 = 4.0

    v1 = -(m2 * v2) / m1 if m1 > 0 else 0.0

    final_momentum = m1 * v1 + m2 * v2

    return {
        "mode": "recoil",
        "scenario": payload.scenario,
        "initial_momentum": round2(initial_momentum),
        "final_momentum": round2(final_momentum),
        "final_velocity1": round2(v1),
        "final_velocity2": round2(v2),
        "summary": (
            f"In recoil, bodies move in opposite directions so that total momentum remains conserved. "
            f"The final total momentum is {round2(final_momentum)} kg·m/s."
        )
    }


def calculate_momentum_collision(payload):
    if payload.mode == "momentum":
        return calculate_single_momentum(payload)

    if payload.mode == "collision":
        return calculate_collision(payload)

    return calculate_recoil(payload)