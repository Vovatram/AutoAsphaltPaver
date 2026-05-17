from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AutoAsphaltPaver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Stub data ────────────────────────────────────────────────────────────────

ROADS = [
    {
        "id": 1,
        "name": "102-й километр",
        "coords": [56.390318, 36.571799],
        "polygon": [
            [56.386357, 36.575216],
            [56.386231, 36.575442],
            [56.394278, 36.568381],
            [56.394404, 36.568155],
        ],
        "photo": "https://picsum.photos/seed/road1/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1 (А→Б)", "condition": "Удовлетворительное", "last_paved": "2021-03-15"},
            {"id": 2, "name": "Полоса 2 (Б→А)", "condition": "Плохое",              "last_paved": "2019-08-20"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +18°C, ясно — ремонт возможен",
        "weather_windows": ["08:00–12:00", "14:00–18:00"],
        "repair_hours": 72,
    },
    {
        "id": 2,
        "name": "123-й километр",
        "coords": [56.568796, 36.478926],
        "polygon": [
            [56.564770, 36.481135],
            [56.564644, 36.481361],
            [56.572822, 36.476717],
            [56.572948, 36.476491],
        ],
        "photo": "https://picsum.photos/seed/road2/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "condition": "Хорошее",            "last_paved": "2023-06-10"},
            {"id": 2, "name": "Полоса 2", "condition": "Удовлетворительное", "last_paved": "2022-04-05"},
            {"id": 3, "name": "Полоса 3", "condition": "Критическое",        "last_paved": "2017-11-30"},
        ],
        "weather_suitable": False,
        "weather_note": "Ожидаются осадки (дождь) — ремонт не рекомендуется",
        "weather_windows": [],
        "repair_hours": 120,
    },
    {
        "id": 3,
        "name": "361-й километр",
        "coords": [57.930603, 33.928645],
        "polygon": [
            [57.929219, 33.932381],
            [57.929093, 33.932607],
            [57.931987, 33.924909],
            [57.932113, 33.924683],
        ],
        "photo": "https://picsum.photos/seed/road3/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "condition": "Критическое", "last_paved": "2015-05-22"},
            {"id": 2, "name": "Полоса 2", "condition": "Плохое",      "last_paved": "2018-09-14"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +22°C, ясно — ремонт возможен",
        "weather_windows": ["09:00–17:00"],
        "repair_hours": 96,
    },
    {
        "id": 4,
        "name": "302-й километр",
        "coords": [57.472149, 34.349623],
        "polygon": [
            [57.469799, 34.356485],
            [57.469673, 34.356711],
            [57.474499, 34.342760],
            [57.474625, 34.342534],
        ],
        "photo": "https://picsum.photos/seed/road4/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "condition": "Плохое", "last_paved": "2020-07-18"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +15°C, без осадков — ремонт возможен",
        "weather_windows": ["07:00–13:00"],
        "repair_hours": 48,
    },
    {
        "id": 5,
        "name": "151-й километр",
        "coords": [56.761401, 36.207698],
        "polygon": [
            [56.758565, 36.213815],
            [56.758439, 36.214041],
            [56.764236, 36.201581],
            [56.764362, 36.201355],
        ],
        "photo": "https://picsum.photos/seed/road5/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "condition": "Удовлетворительное", "last_paved": "2022-11-01"},
            {"id": 2, "name": "Полоса 2", "condition": "Хорошее",            "last_paved": "2024-03-20"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +12°C, без осадков — ремонт возможен",
        "weather_windows": ["08:00–11:00", "15:00–18:00"],
        "repair_hours": 60,
    },
]

_VEHICLES_F1 = [
    {
        "id": 11, "type": "dump_truck", "name": "Самосвал КамАЗ-6522 №05",
        "schedule": [
            {"date": "2026-05-17", "time": "07:45", "location": "АБЗ №1", "task": "Загрузка асфальтобетоном"},
            {"date": "2026-05-17", "time": "09:00", "location": "ул. Ленина уч.1", "task": "Выгрузка"},
            {"date": "2026-05-17", "time": "10:00", "location": "АБЗ №1", "task": "Повторная загрузка"},
        ],
    },
    {
        "id": 12, "type": "dump_truck", "name": "Самосвал КамАЗ-65115 №06",
        "schedule": [
            {"date": "2026-05-17", "time": "08:00", "location": "АБЗ №1", "task": "Ожидание загрузки"},
            {"date": "2026-05-17", "time": "09:15", "location": "ул. Пушкина уч.3", "task": "Выгрузка"},
        ],
    },
]

_VEHICLES_F3 = [
    {
        "id": 13, "type": "dump_truck", "name": "Самосвал МАЗ-6516 №07",
        "schedule": [
            {"date": "2026-05-17", "time": "07:30", "location": "АБЗ №3", "task": "Загрузка асфальтобетоном холодным"},
            {"date": "2026-05-17", "time": "09:30", "location": "ул. Советская уч.2", "task": "Выгрузка"},
        ],
    },
]

FACTORIES = [
    {
        "id": "abz_1_msk",
        "name": "АБЗ-1",
        "coords": [55.859778, 37.536148],
        "vehicle_count": 2,
        "vehicles": _VEHICLES_F1,
        "mix_temp_c": None,
        "active": True,
        "capacity_t_per_hour": None,
        "materials": ["Асфальтобетон горячий тип А", "Битум БНД 60/90", "Щебень фр. 5-20"],
    },
    {
        "id": "abz_leninsky_tver",
        "name": "АБЗ Ленинский",
        "coords": [56.789664, 35.864321],
        "vehicle_count": 0,
        "vehicles": [],
        "mix_temp_c": None,
        "active": True,
        "capacity_t_per_hour": None,
        "materials": [],
    },
    {
        "id": "abz_likhoslavl",
        "name": "АБЗ (Лихославльский муниципальный округ)",
        "coords": [57.129092, 35.434167],
        "vehicle_count": 1,
        "vehicles": _VEHICLES_F3,
        "mix_temp_c": None,
        "active": True,
        "capacity_t_per_hour": None,
        "materials": ["Асфальтобетон холодный", "Битумная эмульсия катионная"],
    },
]

_VEHICLES_P1 = [
    {
        "id": 1, "type": "dump_truck", "name": "Самосвал КамАЗ-6522 №01",
        "schedule": [
            {"date": "2026-05-17", "time": "08:00", "location": "Стоянка №1",         "task": "Погрузка на АБЗ №1"},
            {"date": "2026-05-17", "time": "09:30", "location": "ул. Ленина уч.1",    "task": "Выгрузка материала"},
            {"date": "2026-05-17", "time": "10:15", "location": "АБЗ №1",             "task": "Обратный рейс — погрузка"},
            {"date": "2026-05-17", "time": "11:45", "location": "ул. Ленина уч.1",    "task": "Выгрузка материала"},
            {"date": "2026-05-17", "time": "14:00", "location": "Стоянка №1",         "task": "Конец смены"},
        ],
    },
    {
        "id": 2, "type": "dump_truck", "name": "Самосвал КамАЗ-6522 №02",
        "schedule": [
            {"date": "2026-05-17", "time": "08:00", "location": "Стоянка №1",         "task": "Погрузка на АБЗ №1"},
            {"date": "2026-05-17", "time": "09:30", "location": "ул. Ленина уч.1",    "task": "Выгрузка"},
            {"date": "2026-05-17", "time": "10:30", "location": "АБЗ №1",             "task": "Погрузка"},
            {"date": "2026-05-17", "time": "12:00", "location": "ул. Советская уч.2", "task": "Выгрузка"},
            {"date": "2026-05-17", "time": "14:00", "location": "Стоянка №1",         "task": "Конец смены"},
        ],
    },
    {
        "id": 3, "type": "transfer_machine", "name": "Перегружатель Roadtec SB-2500",
        "schedule": [
            {"date": "2026-05-17", "time": "09:00", "location": "ул. Ленина уч.1",    "task": "Подготовка к работе"},
            {"date": "2026-05-17", "time": "09:30", "location": "ул. Ленина уч.1",    "task": "Перегрузка смеси в укладчик"},
            {"date": "2026-05-17", "time": "13:00", "location": "ул. Советская уч.2", "task": "Переезд"},
            {"date": "2026-05-17", "time": "13:30", "location": "ул. Советская уч.2", "task": "Перегрузка смеси"},
            {"date": "2026-05-17", "time": "16:00", "location": "Стоянка №1",         "task": "Возврат"},
        ],
    },
    {
        "id": 4, "type": "paver", "name": "Асфальтоукладчик Vogele SUPER 1800-3i",
        "schedule": [
            {"date": "2026-05-17", "time": "09:30", "location": "ул. Ленина уч.1",    "task": "Укладка полосы 1"},
            {"date": "2026-05-17", "time": "11:30", "location": "ул. Ленина уч.1",    "task": "Укладка полосы 2"},
            {"date": "2026-05-17", "time": "13:00", "location": "ул. Советская уч.2", "task": "Переезд"},
            {"date": "2026-05-17", "time": "13:30", "location": "ул. Советская уч.2", "task": "Укладка"},
            {"date": "2026-05-17", "time": "16:00", "location": "Стоянка №1",         "task": "Возврат"},
        ],
    },
    {
        "id": 5, "type": "roller", "name": "Каток Bomag BW 213 D-5",
        "schedule": [
            {"date": "2026-05-17", "time": "10:00", "location": "ул. Ленина уч.1",    "task": "Уплотнение полосы 1 (3 прохода)"},
            {"date": "2026-05-17", "time": "12:00", "location": "ул. Ленина уч.1",    "task": "Уплотнение полосы 2"},
            {"date": "2026-05-17", "time": "13:30", "location": "ул. Советская уч.2", "task": "Переезд"},
            {"date": "2026-05-17", "time": "14:00", "location": "ул. Советская уч.2", "task": "Уплотнение"},
            {"date": "2026-05-17", "time": "16:30", "location": "Стоянка №1",         "task": "Возврат"},
        ],
    },
]

_VEHICLES_P2 = [
    {
        "id": 6, "type": "dump_truck", "name": "Самосвал КамАЗ-65115 №03",
        "schedule": [
            {"date": "2026-05-17", "time": "08:30", "location": "Стоянка №2",         "task": "Погрузка на АБЗ №2"},
            {"date": "2026-05-17", "time": "10:00", "location": "пр. Победы уч.5",    "task": "Выгрузка"},
            {"date": "2026-05-17", "time": "11:00", "location": "АБЗ №2",             "task": "Погрузка"},
            {"date": "2026-05-17", "time": "12:30", "location": "ул. Пушкина уч.3",   "task": "Выгрузка"},
            {"date": "2026-05-17", "time": "15:00", "location": "Стоянка №2",         "task": "Конец смены"},
        ],
    },
    {
        "id": 7, "type": "dump_truck", "name": "Самосвал КамАЗ-65115 №04",
        "schedule": [
            {"date": "2026-05-17", "time": "08:30", "location": "Стоянка №2",         "task": "Погрузка на АБЗ №2"},
            {"date": "2026-05-17", "time": "10:00", "location": "пр. Победы уч.5",    "task": "Выгрузка"},
            {"date": "2026-05-17", "time": "11:30", "location": "АБЗ №2",             "task": "Погрузка"},
            {"date": "2026-05-17", "time": "13:00", "location": "пр. Победы уч.5",    "task": "Выгрузка"},
            {"date": "2026-05-17", "time": "16:00", "location": "Стоянка №2",         "task": "Конец смены"},
        ],
    },
    {
        "id": 8, "type": "transfer_machine", "name": "Перегружатель Vogele MT 3000-2i",
        "schedule": [
            {"date": "2026-05-17", "time": "09:30", "location": "пр. Победы уч.5",    "task": "Перегрузка смеси"},
            {"date": "2026-05-17", "time": "14:00", "location": "ул. Пушкина уч.3",   "task": "Переезд и перегрузка"},
            {"date": "2026-05-17", "time": "16:30", "location": "Стоянка №2",         "task": "Возврат"},
        ],
    },
    {
        "id": 9, "type": "paver", "name": "Асфальтоукладчик Bomag BF 600 C-2",
        "schedule": [
            {"date": "2026-05-17", "time": "09:30", "location": "пр. Победы уч.5",    "task": "Укладка полосы 1"},
            {"date": "2026-05-17", "time": "12:00", "location": "пр. Победы уч.5",    "task": "Укладка полосы 3"},
            {"date": "2026-05-17", "time": "14:00", "location": "ул. Пушкина уч.3",   "task": "Укладка"},
            {"date": "2026-05-17", "time": "16:30", "location": "Стоянка №2",         "task": "Возврат"},
        ],
    },
    {
        "id": 10, "type": "roller", "name": "Каток Hamm HD 14 VV",
        "schedule": [
            {"date": "2026-05-17", "time": "10:00", "location": "пр. Победы уч.5",    "task": "Уплотнение"},
            {"date": "2026-05-17", "time": "13:00", "location": "пр. Победы уч.5",    "task": "Контрольные проходы"},
            {"date": "2026-05-17", "time": "14:30", "location": "ул. Пушкина уч.3",   "task": "Уплотнение"},
            {"date": "2026-05-17", "time": "17:00", "location": "Стоянка №2",         "task": "Возврат"},
        ],
    },
]

PARKINGS = [
    {"id": 1, "name": "Стоянка №1",  "coords": [56.564175, 36.442860], "vehicles": _VEHICLES_P1},
    {"id": 2, "name": "Стоянка №2", "coords": [57.240149, 34.899585], "vehicles": _VEHICLES_P2},
]

_ALL_VEHICLES = _VEHICLES_P1 + _VEHICLES_P2 + _VEHICLES_F1 + _VEHICLES_F3


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/roads")
def get_roads():
    print("GET /api/roads")
    return [{"id": r["id"], "name": r["name"], "coords": r["coords"], "polygon": r["polygon"]} for r in ROADS]


@app.get("/api/roads/{road_id}")
def get_road(road_id: int):
    print(f"GET /api/roads/{road_id}")
    road = next((r for r in ROADS if r["id"] == road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    return road


@app.get("/api/factories")
def get_factories():
    print("GET /api/factories")
    return [
        {k: v for k, v in f.items() if k != "vehicles"}
        for f in FACTORIES
    ]


@app.get("/api/factories/{factory_id}")
def get_factory(factory_id: str):
    print(f"GET /api/factories/{factory_id}")
    factory = next((f for f in FACTORIES if f["id"] == factory_id), None)
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")
    return factory


@app.get("/api/parkings")
def get_parkings():
    print("GET /api/parkings")
    return [
        {
            "id": p["id"],
            "name": p["name"],
            "coords": p["coords"],
            "vehicle_count": len(p["vehicles"]),
        }
        for p in PARKINGS
    ]


@app.get("/api/parkings/{parking_id}")
def get_parking(parking_id: int):
    print(f"GET /api/parkings/{parking_id}")
    parking = next((p for p in PARKINGS if p["id"] == parking_id), None)
    if not parking:
        raise HTTPException(status_code=404, detail="Parking not found")
    return parking


@app.get("/api/lanes")
def get_all_lanes():
    print("GET /api/lanes")
    result = []
    for road in ROADS:
        for lane in road["lanes"]:
            result.append({
                "id": lane["id"],
                "road_id": road["id"],
                "road_name": road["name"],
                "repair_hours": road["repair_hours"],
                "name": lane["name"],
                "condition": lane["condition"],
                "last_paved": lane["last_paved"],
                "weather_suitable": road["weather_suitable"],
                "weather_note": road["weather_note"],
                "weather_windows": road.get("weather_windows", []),
            })
    return result


@app.get("/api/vehicles")
def get_all_vehicles(type: str = None):
    print(f"GET /api/vehicles type={type}")
    result = _ALL_VEHICLES if not type else [v for v in _ALL_VEHICLES if v["type"] == type]
    return result


@app.get("/api/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: int):
    print(f"GET /api/vehicles/{vehicle_id}")
    v = next((v for v in _ALL_VEHICLES if v["id"] == vehicle_id), None)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


class PlanRequest(BaseModel):
    road_id: int
    lane_id: int


@app.post("/api/plans")
def create_plan(req: PlanRequest):
    print(f"POST /api/plans road_id={req.road_id} lane_id={req.lane_id}")
    road = next((r for r in ROADS if r["id"] == req.road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    dump_truck_count = max(2, round(road["repair_hours"] / 36))

    def suggest(type_key, count):
        return [
            {"id": v["id"], "name": v["name"], "type": v["type"]}
            for v in _ALL_VEHICLES if v["type"] == type_key
        ][:count]

    plan = {
        "road_name": road["name"],
        "dump_trucks": dump_truck_count,
        "transfer_machines": 1,
        "pavers": 1,
        "rollers": 2,
        "closure_vehicles": 1,
        "suggested_vehicles": {
            "dump_truck":       suggest("dump_truck", dump_truck_count),
            "transfer_machine": suggest("transfer_machine", 1),
            "paver":            suggest("paver", 1),
            "roller":           suggest("roller", 2),
            "closure_vehicle":  suggest("closure_vehicle", 1),
        },
    }
    print(f"  → plan: dump_trucks={dump_truck_count}")
    return plan


@app.post("/api/auth/register")
def register(body: dict):
    print(f"POST /api/auth/register username={body.get('username')}")
    return {"ok": True, "message": "Регистрация успешна"}


@app.post("/api/auth/login")
def login(body: dict):
    print(f"POST /api/auth/login username={body.get('username')}")
    return {"ok": True, "message": "Вход выполнен"}
