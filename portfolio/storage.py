from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class RawUploadStorage(Storage):
    """Use local filesystem storage in development and Cloudinary for PDFs in production."""

    def __init__(self):
        self._backend = None

    def _get_backend(self):
        if self._backend is None:
            if getattr(settings, "USE_CLOUDINARY_MEDIA", False):
                from cloudinary_storage.storage import RawMediaCloudinaryStorage

                self._backend = RawMediaCloudinaryStorage()
            else:
                self._backend = FileSystemStorage(
                    location=settings.MEDIA_ROOT,
                    base_url=settings.MEDIA_URL,
                )

        return self._backend

    def _open(self, name, mode="rb"):
        return self._get_backend().open(name, mode)

    def _save(self, name, content):
        return self._get_backend().save(name, content)

    def delete(self, name):
        return self._get_backend().delete(name)

    def exists(self, name):
        return self._get_backend().exists(name)

    def listdir(self, path):
        return self._get_backend().listdir(path)

    def size(self, name):
        return self._get_backend().size(name)

    def url(self, name):
        return self._get_backend().url(name)

    def path(self, name):
        return self._get_backend().path(name)

    def get_accessed_time(self, name):
        return self._get_backend().get_accessed_time(name)

    def get_created_time(self, name):
        return self._get_backend().get_created_time(name)

    def get_modified_time(self, name):
        return self._get_backend().get_modified_time(name)
