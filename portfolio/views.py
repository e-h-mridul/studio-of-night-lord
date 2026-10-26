from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from .forms import ContactForm
from .models import (
    Certification,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
    SocialLink,
)


@require_http_methods(["GET", "POST"])
def home(request):
    form = ContactForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Thank you! Your message was saved successfully.")
        return HttpResponseRedirect(reverse("portfolio:home") + "#contact")

    context = {
        "profile": Profile.objects.first(),
        "skills": Skill.objects.all(),
        "projects": Project.objects.order_by("-featured", "order", "-id"),
        "experiences": Experience.objects.all(),
        "education_items": Education.objects.all(),
        "certifications": Certification.objects.all(),
        "social_links": SocialLink.objects.all(),
        "form": form,
    }
    return render(request, "portfolio/home.html", context)


def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    return render(
        request,
        "portfolio/project_detail.html",
        {"project": project, "profile": Profile.objects.first()},
    )
