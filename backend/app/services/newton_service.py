from typing import List, Dict
from app.models.newton import MotionPoint, DualMotionPoint


class NewtonService:
    def _build_single_body_points(
        self,
        time: float,
        acceleration: float,
        initial_velocity: float = 0.0,
        num_points: int = 120
    ) -> List[MotionPoint]:
        points: List[MotionPoint] = []

        for i in range(num_points + 1):
            t = (time * i) / num_points
            v = initial_velocity + acceleration * t
            x = initial_velocity * t + 0.5 * acceleration * (t ** 2)

            points.append(
                MotionPoint(
                    t=round(t, 4),
                    x=round(x, 4),
                    v=round(v, 4)
                )
            )

        return points

    def _build_first_law_points(
        self,
        time: float,
        initial_velocity: float,
        friction_enabled: bool,
        friction_force: float,
        mass: float,
        num_points: int = 120
    ) -> List[MotionPoint]:
        points: List[MotionPoint] = []

        if not friction_enabled or abs(initial_velocity) < 1e-9:
            for i in range(num_points + 1):
                t = (time * i) / num_points
                x = initial_velocity * t
                points.append(
                    MotionPoint(
                        t=round(t, 4),
                        x=round(x, 4),
                        v=round(initial_velocity, 4)
                    )
                )
            return points

        deceleration = friction_force / mass
        stopping_time = abs(initial_velocity) / deceleration if deceleration > 0 else time
        direction = 1 if initial_velocity >= 0 else -1

        for i in range(num_points + 1):
            t = (time * i) / num_points

            if t <= stopping_time:
                v = initial_velocity - direction * deceleration * t
                x = initial_velocity * t - 0.5 * direction * deceleration * (t ** 2)
            else:
                v = 0.0
                x_stop = (
                    initial_velocity * stopping_time
                    - 0.5 * direction * deceleration * (stopping_time ** 2)
                )
                x = x_stop

            points.append(
                MotionPoint(
                    t=round(t, 4),
                    x=round(x, 4),
                    v=round(v, 4)
                )
            )

        return points

    def calculate_first_law(
        self,
        mass: float,
        gravity: float,
        time: float,
        initial_velocity: float,
        friction_enabled: bool,
        friction_coefficient: float
    ) -> Dict:
        friction_force = friction_coefficient * mass * gravity if friction_enabled else 0.0

        if not friction_enabled:
            acceleration = 0.0
            final_velocity = initial_velocity
            displacement = initial_velocity * time
            summary = "With zero net force, the object stays at rest or moves with constant velocity."
        else:
            direction = 1 if initial_velocity >= 0 else -1
            acceleration = -(direction * friction_force / mass) if abs(initial_velocity) > 1e-9 else 0.0
            stopping_time = abs(initial_velocity) / (friction_force / mass) if friction_force > 0 and abs(initial_velocity) > 1e-9 else 0.0

            if time <= stopping_time:
                final_velocity = initial_velocity + acceleration * time
                displacement = initial_velocity * time + 0.5 * acceleration * (time ** 2)
            else:
                final_velocity = 0.0
                displacement = (
                    initial_velocity * stopping_time
                    + 0.5 * acceleration * (stopping_time ** 2)
                )

            summary = "Friction introduces a net force, so the object no longer maintains constant velocity."

        points = self._build_first_law_points(
            time=time,
            initial_velocity=initial_velocity,
            friction_enabled=friction_enabled,
            friction_force=friction_force,
            mass=mass
        )

        return {
            "lawType": "first",
            "summary": summary,
            "net_force": round(-friction_force if friction_enabled else 0.0, 2),
            "acceleration": round(acceleration, 2),
            "final_velocity": round(final_velocity, 2),
            "displacement": round(displacement, 2),
            "friction_force": round(friction_force, 2),
            "points": points
        }

    def calculate_second_law(
        self,
        mass: float,
        applied_force: float,
        friction_coefficient: float,
        gravity: float,
        time: float
    ) -> Dict:
        friction_force = friction_coefficient * mass * gravity
        net_force = applied_force - friction_force
        acceleration = net_force / mass
        final_velocity = acceleration * time
        displacement = 0.5 * acceleration * (time ** 2)

        points = self._build_single_body_points(
            time=time,
            acceleration=acceleration,
            initial_velocity=0.0
        )

        return {
            "lawType": "second",
            "summary": "Acceleration depends on the net force and inversely on mass, consistent with F = ma.",
            "net_force": round(net_force, 2),
            "acceleration": round(acceleration, 2),
            "final_velocity": round(final_velocity, 2),
            "displacement": round(displacement, 2),
            "friction_force": round(friction_force, 2),
            "points": points
        }

    def calculate_third_law(
        self,
        mass_a: float,
        mass_b: float,
        interaction_force: float,
        interaction_time: float
    ) -> Dict:
        acceleration_a = interaction_force / mass_a
        acceleration_b = -interaction_force / mass_b

        final_velocity_a = acceleration_a * interaction_time
        final_velocity_b = acceleration_b * interaction_time

        displacement_a = 0.5 * acceleration_a * (interaction_time ** 2)
        displacement_b = 0.5 * acceleration_b * (interaction_time ** 2)

        points: List[DualMotionPoint] = []
        num_points = 120

        for i in range(num_points + 1):
            t = (interaction_time * i) / num_points
            x_a = 0.5 * acceleration_a * (t ** 2)
            x_b = 0.5 * acceleration_b * (t ** 2)
            v_a = acceleration_a * t
            v_b = acceleration_b * t

            points.append(
                DualMotionPoint(
                    t=round(t, 4),
                    xA=round(x_a, 4),
                    xB=round(x_b, 4),
                    vA=round(v_a, 4),
                    vB=round(v_b, 4)
                )
            )

        return {
            "lawType": "third",
            "summary": "Interaction forces are equal in magnitude and opposite in direction.",
            "force_on_a": round(interaction_force, 2),
            "force_on_b": round(-interaction_force, 2),
            "acceleration_a": round(acceleration_a, 2),
            "acceleration_b": round(acceleration_b, 2),
            "final_velocity_a": round(final_velocity_a, 2),
            "final_velocity_b": round(final_velocity_b, 2),
            "displacement_a": round(displacement_a, 2),
            "displacement_b": round(displacement_b, 2),
            "dual_points": points
        }

    def calculate(self, payload) -> Dict:
        if payload.lawType == "first":
            return self.calculate_first_law(
                mass=payload.mass,
                gravity=payload.gravity,
                time=payload.time,
                initial_velocity=payload.initialVelocity,
                friction_enabled=payload.frictionEnabled,
                friction_coefficient=payload.frictionCoefficient
            )

        if payload.lawType == "second":
            return self.calculate_second_law(
                mass=payload.mass,
                applied_force=payload.appliedForce,
                friction_coefficient=payload.frictionCoefficient,
                gravity=payload.gravity,
                time=payload.time
            )

        return self.calculate_third_law(
            mass_a=payload.massA,
            mass_b=payload.massB,
            interaction_force=payload.interactionForce,
            interaction_time=payload.interactionTime
        )