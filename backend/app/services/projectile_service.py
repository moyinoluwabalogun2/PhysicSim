import math
from typing import List, Tuple, Optional
from app.models.projectile import Point


class ProjectileService:
    def __init__(self):
        self.air_density = 1.225  # kg/m³

    def calculate_without_air_resistance(
        self,
        angle: float,
        velocity: float,
        gravity: float,
        initial_height: float
    ) -> Tuple[float, float, float, List[Point], float]:
        angle_rad = math.radians(angle)

        vx = velocity * math.cos(angle_rad)
        vy = velocity * math.sin(angle_rad)

        a = -0.5 * gravity
        b = vy
        c = initial_height

        discriminant = b**2 - 4 * a * c
        if discriminant < 0:
            t_flight = 0.0
        else:
            root1 = (-b + math.sqrt(discriminant)) / (2 * a)
            root2 = (-b - math.sqrt(discriminant)) / (2 * a)
            t_flight = max(root1, root2)

        t_max = vy / gravity if gravity != 0 else 0
        max_height = initial_height + vy * t_max - 0.5 * gravity * t_max**2
        range_distance = vx * t_flight

        points: List[Point] = []
        num_points = 120

        for i in range(num_points + 1):
            t = (t_flight * i) / num_points if num_points > 0 else 0
            x = vx * t
            y = initial_height + vy * t - 0.5 * gravity * t**2

            if y >= 0:
                points.append(Point(x=round(x, 4), y=round(y, 4)))
            else:
                break

        final_vx = vx
        final_vy = vy - gravity * t_flight
        final_velocity = math.sqrt(final_vx**2 + final_vy**2)

        return t_flight, max_height, range_distance, points, final_velocity

    def calculate_with_air_resistance(
        self,
        angle: float,
        velocity: float,
        gravity: float,
        initial_height: float,
        mass: float,
        diameter: float,
        drag_coefficient: float
    ) -> Tuple[float, float, float, List[Point], float]:
        angle_rad = math.radians(angle)

        x = 0.0
        y = initial_height
        vx = velocity * math.cos(angle_rad)
        vy = velocity * math.sin(angle_rad)

        area = math.pi * (diameter / 2) ** 2
        dt = 0.01
        max_time = 100.0

        points: List[Point] = [Point(x=round(x, 4), y=round(y, 4))]
        max_height_reached = y
        t = 0.0

        last_valid_x = x
        last_valid_y = y

        while t < max_time and y >= 0:
            speed = math.sqrt(vx**2 + vy**2)

            if speed > 0:
                drag_force = (
                    0.5
                    * drag_coefficient
                    * self.air_density
                    * area
                    * speed**2
                )
                ax = -(drag_force * vx) / (mass * speed)
                ay = -gravity - (drag_force * vy) / (mass * speed)
            else:
                ax = 0.0
                ay = -gravity

            vx += ax * dt
            vy += ay * dt

            x += vx * dt
            y += vy * dt

            if y > max_height_reached:
                max_height_reached = y

            if y >= 0:
                last_valid_x = x
                last_valid_y = y
                points.append(Point(x=round(x, 4), y=round(y, 4)))
            else:
                if y != last_valid_y:
                    x_ground = last_valid_x + (0 - last_valid_y) * (x - last_valid_x) / (y - last_valid_y)
                    points.append(Point(x=round(x_ground, 4), y=0.0))
                    x = x_ground
                break

            t += dt

        final_velocity = math.sqrt(vx**2 + vy**2)
        return t, max_height_reached, x, points, final_velocity

    def calculate_trajectory(
        self,
        angle: float,
        velocity: float,
        gravity: float,
        initial_height: float,
        air_resistance: bool,
        mass: float,
        diameter: float,
        drag_coefficient: float,
        compare_ideal_path: bool = False
    ) -> dict:
        if air_resistance:
            t_flight, max_height, range_distance, points, final_velocity = (
                self.calculate_with_air_resistance(
                    angle,
                    velocity,
                    gravity,
                    initial_height,
                    mass,
                    diameter,
                    drag_coefficient
                )
            )
        else:
            t_flight, max_height, range_distance, points, final_velocity = (
                self.calculate_without_air_resistance(
                    angle,
                    velocity,
                    gravity,
                    initial_height
                )
            )

        ideal_points = None
        if compare_ideal_path:
            _, _, _, ideal_points_raw, _ = self.calculate_without_air_resistance(
                angle,
                velocity,
                gravity,
                initial_height
            )
            ideal_points = ideal_points_raw

        return {
            "time_of_flight": round(t_flight, 2),
            "max_height": round(max(max_height, 0), 2),
            "range": round(range_distance, 2),
            "points": points,
            "final_velocity": round(final_velocity, 2),
            "ideal_points": ideal_points
        }