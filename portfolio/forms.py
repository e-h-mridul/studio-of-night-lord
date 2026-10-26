from django import forms

from .models import ContactMessage


class ContactForm(forms.ModelForm):
    # This field is not stored. Most human visitors will never fill it in.
    website = forms.CharField(required=False, widget=forms.HiddenInput)

    class Meta:
        model = ContactMessage
        fields = ("name", "email", "subject", "message")
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Your name", "autocomplete": "name"}),
            "email": forms.EmailInput(attrs={"placeholder": "you@example.com", "autocomplete": "email"}),
            "subject": forms.TextInput(attrs={"placeholder": "What would you like to discuss?"}),
            "message": forms.Textarea(attrs={"placeholder": "Tell me about your idea or question...", "rows": 5}),
        }

    def clean_website(self):
        value = self.cleaned_data.get("website", "")
        if value:
            raise forms.ValidationError("The message could not be submitted.")
        return value
