from django.db import models
from django.core.validators import FileExtensionValidator
from .storage import RawUploadStorage


class Profile(models.Model):
    full_name = models.CharField(max_length=120)
    headline = models.CharField(max_length=200)
    introduction = models.TextField(blank=True)
    about = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    location = models.CharField(max_length=120, blank=True)
    available_for_work = models.BooleanField(default=True)
    resume = models.FileField(
        upload_to="resumes/",
        blank=True,
        storage=RawUploadStorage(),
    )
    portrait_primary = models.ImageField(
    upload_to="profile/portraits/",
    blank=True,
    )

    portrait_secondary = models.ImageField(
        upload_to="profile/portraits/",
        blank=True,
    )
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)

    def __str__(self):
        return self.full_name


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ("frontend", "Frontend"),
        ("backend", "Backend"),
        ("database", "Database"),
        ("tools", "Tools"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="other"
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Project(models.Model):
    title = models.CharField(max_length=150)
    slug = models.SlugField(unique=True)
    summary = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    technologies = models.CharField(max_length=300, blank=True)
    image = models.ImageField(
        upload_to="projects/",
        blank=True
    )
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-id"]

    def __str__(self):
        return self.title


class Experience(models.Model):
    role = models.CharField(max_length=150)
    company = models.CharField(max_length=150)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-id"]

    def __str__(self):
        return f"{self.role} - {self.company}"


class Education(models.Model):
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    period = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-id"]

    def __str__(self):
        return self.degree



class Certification(models.Model):
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=150)
    year = models.CharField(max_length=20, blank=True)
    credential_url = models.URLField(blank=True)

    image = models.ImageField(
        "Certificate image",
        upload_to="certificates/images/",
        blank=True,
    )

    pdf_file = models.FileField(
        "Certificate PDF",
        upload_to="certificates/pdfs/",
        blank=True,
        validators=[FileExtensionValidator(["pdf"])],
        storage=RawUploadStorage(),
    )

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-id"]

    def __str__(self):
        return self.title


class SocialLink(models.Model):
    platform = models.CharField(max_length=100)
    url = models.URLField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "platform"]

    def __str__(self):
        return self.platform


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.subject}"
