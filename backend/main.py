from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
        "name": "ул. Ленина, уч. №1",
        "coords": [55.7512, 37.6184],
        "photo": "https://picsum.photos/seed/road1/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1 (А→Б)", "condition": "Удовлетворительное", "last_paved": "2021-03-15"},
            {"id": 2, "name": "Полоса 2 (Б→А)", "condition": "Плохое",              "last_paved": "2019-08-20"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +18°C, ясно — ремонт возможен",
        "repair_hours": 72,
    },
    {
        "id": 2,
        "name": "пр. Победы, уч. №5",
        "coords": [55.7625, 37.6350],
        "photo": "https://picsum.photos/seed/road2/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "condition": "Хорошее",            "last_paved": "2023-06-10"},
            {"id": 2, "name": "Полоса 2", "condition": "Удовлетворительное", "last_paved": "2022-04-05"},
            {"id": 3, "name": "Полоса 3", "condition": "Критическое",        "last_paved": "2017-11-30"},
        ],
        "weather_suitable": False,
        "weather_note": "Ожидаются осадки (дождь) — ремонт не рекомендуется",
        "repair_hours": 120,
    },
    {
        "id": 3,
        "name": "ул. Советская, уч. №2",
        "coords": [55.7400, 37.6050],
        "photo": "https://picsum.photos/seed/road3/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "condition": "Критическое", "last_paved": "2015-05-22"},
            {"id": 2, "name": "Полоса 2", "condition": "Плохое",      "last_paved": "2018-09-14"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +22°C, ясно — ремонт возможен",
        "repair_hours": 96,
    },
    {
        "id": 4,
        "name": "ул. Пушкина, уч. №3",
        "coords": [55.7580, 37.5900],
        "photo": "https://picsum.photos/seed/road4/600/280",
        "lanes": [
            {"id": 1, "name": "Полоса 1", "condition": "Плохое", "last_paved": "2020-07-18"},
        ],
        "weather_suitable": True,
        "weather_note": "Температура +15°C, без осадков — ремонт возможен",
        "repair_hours": 48,
    },
]

FACTORIES = [
    {
        "id": 1,
        "name": "АБЗ «Дорожник» №1",
        "coords": [55.7800, 37.5600],
        "materials": ["Асфальтобетон горячий тип А", "Битум БНД 60/90", "Щебень фр. 5-20"],
        "capacity_tons_day": 500,
    },
    {
        "id": 2,
        "name": "АБЗ «СтройДор» №2",
        "coords": [55.7250, 37.6600],
        "materials": ["Асфальтобетон горячий тип Б", "Щебеночно-мастичный асфальт СМА-16"],
        "capacity_tons_day": 350,
    },
    {
        "id": 3,
        "name": "АБЗ «МосДорСтрой» №3",
        "coords": [55.7700, 37.6450],
        "materials": ["Асфальтобетон холодный", "Битумная эмульсия катионная"],
        "capacity_tons_day": 280,
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
    {"id": 1, "name": "Стоянка №1 (Западная)",  "coords": [55.7550, 37.5800], "vehicles": _VEHICLES_P1},
    {"id": 2, "name": "Стоянка №2 (Восточная)", "coords": [55.7450, 37.6450], "vehicles": _VEHICLES_P2},
]

_ALL_VEHICLES = _VEHICLES_P1 + _VEHICLES_P2


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/roads")
def get_roads():
    return [{"id": r["id"], "name": r["name"], "coords": r["coords"]} for r in ROADS]


@app.get("/api/roads/{road_id}")
def get_road(road_id: int):
    road = next((r for r in ROADS if r["id"] == road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    return road


@app.get("/api/factories")
def get_factories():
    return FACTORIES


@app.get("/api/parkings")
def get_parkings():
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
    parking = next((p for p in PARKINGS if p["id"] == parking_id), None)
    if not parking:
        raise HTTPException(status_code=404, detail="Parking not found")
    return parking


@app.get("/api/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: int):
    v = next((v for v in _ALL_VEHICLES if v["id"] == vehicle_id), None)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v
