from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from alumni.models import AlumniProfile
from employers.models import Employer  # 👈 добавили
from django.db.models import Count, Q

class EmploymentStatsView(APIView):
    """
    Возвращает статистику трудоустройства:
      - общее количество выпускников по годам
      - количество трудоустроенных / безработных
      - % трудоустроенных
      - общее количество работодателей
    Формат ответа:
    {
      "2021": {"total": 50, "employed": 35, "unemployed": 15, "percent_employed": 70.0},
      ...
      "meta": {
        "total_employers": 78
      }
    }
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        # Группировка по году выпуска
        qs = AlumniProfile.objects.values("graduation_year").annotate(
            total=Count("id"),
            employed_count=Count("id", filter=Q(is_employed=True)),
            unemployed_count=Count("id", filter=Q(is_employed=False)),
        ).order_by("graduation_year")

        result = {}
        for entry in qs:
            year = entry["graduation_year"]
            total = entry["total"]
            employed = entry["employed_count"]
            unemployed = entry["unemployed_count"]
            percent = round(employed / total * 100, 2) if total else 0
            result[year] = {
                "total": total,
                "employed": employed,
                "unemployed": unemployed,
                "percent_employed": percent,
            }
        total_employers = Employer.objects.count()
        result["meta"] = {
            "total_employers": total_employers
        }

        return Response(result)
