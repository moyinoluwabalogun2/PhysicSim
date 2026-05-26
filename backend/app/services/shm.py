from math import pi, sqrt, radians


def round2(value: float) -> float:
    return round(value, 2)


def calculate_spring_or_horizontal(payload):
    m = payload.mass
    k = payload.springConstant
    A = payload.amplitude

    omega = sqrt(k / m)
    period = 2 * pi / omega
    max_velocity = A * omega
    max_acceleration = (omega ** 2) * A

    return {
        "mode": payload.mode,
        "angular_frequency": round2(omega),
        "period": round2(period),
        "max_velocity": round2(max_velocity),
        "max_acceleration": round2(max_acceleration),
        "summary": (
            f"This system oscillates with angular frequency {round2(omega)} rad/s "
            f"and period {round2(period)} s."
        )
    }


def calculate_pendulum(payload):
    g = payload.gravity
    L = payload.length
    theta0 = radians(payload.initialAngle)

    omega = sqrt(g / L)
    period = 2 * pi * sqrt(L / g)
    max_velocity = L * omega * theta0
    max_acceleration = (omega ** 2) * L * theta0

    return {
        "mode": "pendulum",
        "angular_frequency": round2(omega),
        "period": round2(period),
        "max_velocity": round2(max_velocity),
        "max_acceleration": round2(max_acceleration),
        "summary": (
            f"Using the small-angle approximation, this pendulum oscillates with "
            f"angular frequency {round2(omega)} rad/s and period {round2(period)} s."
        )
    }


def calculate_shm(payload):
    if payload.mode == "pendulum":
        return calculate_pendulum(payload)

    return calculate_spring_or_horizontal(payload)