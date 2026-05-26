from math import cos, radians, sqrt


def round2(value: float) -> float:
    return round(value, 2)


def calculate_work(payload):
    force = payload.force
    distance = payload.distance
    angle = payload.angle

    work_done = force * distance * cos(radians(angle))

    return {
        "mode": "work",
        "scenario": payload.scenario,
        "force": round2(force),
        "distance": round2(distance),
        "angle": round2(angle),
        "work_done": round2(work_done),
        "summary": (
            f"Work is done when a force moves an object through a distance. "
            f"In this case, the work done is {round2(work_done)} J."
        )
    }


def calculate_energy(payload):
    mass = payload.mass
    gravity = payload.gravity
    scenario = payload.scenario

    # SPRING SCENE
    if scenario == "spring-launch":
        spring_constant = payload.springConstant
        compression = payload.compression

        # total stored elastic energy at the start
        total_energy = 0.5 * spring_constant * (compression ** 2)

        # at full release, spring energy becomes kinetic energy
        launch_velocity = sqrt((2 * total_energy) / mass) if mass > 0 else 0
        final_kinetic_energy = 0.5 * mass * (launch_velocity ** 2)

        return {
            "mode": "energy",
            "scenario": scenario,
            "mass": round2(mass),
            "spring_constant": round2(spring_constant),
            "compression": round2(compression),
            "initial_spring_energy": round2(total_energy),
            "current_spring_energy": round2(total_energy),
            "kinetic_energy": round2(final_kinetic_energy),
            "total_energy": round2(total_energy),
            "launch_velocity": round2(launch_velocity),
            "summary": (
                f"The compressed spring stores {round2(total_energy)} J of elastic energy. "
                f"As the spring releases, that energy changes into kinetic energy."
            )
        }

    # RAMP / HILL SCENES
    initial_height = payload.height
    initial_velocity = payload.velocity

    # total mechanical energy at the beginning
    initial_potential_energy = mass * gravity * initial_height
    initial_kinetic_energy = 0.5 * mass * (initial_velocity ** 2)
    total_energy = initial_potential_energy + initial_kinetic_energy

    # final values if the object reaches height = 0
    final_height = 0
    final_potential_energy = mass * gravity * final_height
    final_kinetic_energy = total_energy - final_potential_energy
    final_velocity = sqrt((2 * final_kinetic_energy) / mass) if mass > 0 else 0

    return {
        "mode": "energy",
        "scenario": scenario,
        "mass": round2(mass),
        "gravity": round2(gravity),
        "initial_height": round2(initial_height),
        "initial_potential_energy": round2(initial_potential_energy),
        "initial_kinetic_energy": round2(initial_kinetic_energy),
        "current_height": round2(initial_height),
        "potential_energy": round2(initial_potential_energy),
        "kinetic_energy": round2(final_kinetic_energy),
        "total_energy": round2(total_energy),
        "final_velocity": round2(final_velocity),
        "summary": (
            f"As the object moves downward, its height decreases, so potential energy decreases. "
            f"That lost potential energy becomes kinetic energy. "
            f"The total mechanical energy is {round2(total_energy)} J."
        )
    }


def calculate_power(payload):
    mass = payload.mass
    gravity = payload.gravity
    height = payload.height
    time = payload.time

    work_done = mass * gravity * height
    power = work_done / time if time > 0 else 0

    return {
        "mode": "power",
        "scenario": payload.scenario,
        "mass": round2(mass),
        "height": round2(height),
        "time": round2(time),
        "work_done": round2(work_done),
        "power": round2(power),
        "summary": (
            f"Power measures how quickly work is done. "
            f"Here, {round2(work_done)} J of work is done in {round2(time)} s, "
            f"giving {round2(power)} W."
        )
    }


def calculate_work_energy_power(payload):
    if payload.mode == "work":
        return calculate_work(payload)

    if payload.mode == "energy":
        return calculate_energy(payload)

    return calculate_power(payload)