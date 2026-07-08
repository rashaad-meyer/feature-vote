from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow read access to anyone; write access only to the object's owner."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by_id == request.user.id
