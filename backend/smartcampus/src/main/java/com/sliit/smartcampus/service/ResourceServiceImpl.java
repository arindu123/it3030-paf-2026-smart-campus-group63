package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.ResourceRequest;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public Resource createResource(ResourceRequest request) {
        validateResourceRequest(request, null);

        Resource resource = new Resource();
        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setDescription(request.getDescription().trim());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setStatus(request.getStatus());

        return resourceRepository.save(resource);
    }

    @Override
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @Override
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    @Override
    public Resource updateResource(Long id, ResourceRequest request) {
        Resource resource = getResourceById(id);
        validateResourceRequest(request, id);

        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setDescription(request.getDescription().trim());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setStatus(request.getStatus());

        return resourceRepository.save(resource);
    }

    @Override
    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }

    @Override
    public Resource updateResourceStatus(Long id, ResourceStatus status) {
        Resource resource = getResourceById(id);
        resource.setStatus(status);
        return resourceRepository.save(resource);
    }

    private void validateResourceRequest(ResourceRequest request, Long currentResourceId) {
        if (request == null) {
            throw new BadRequestException("Resource details are required.");
        }

        String name = request.getName() == null ? "" : request.getName().trim();
        String location = request.getLocation() == null ? "" : request.getLocation().trim();
        String description = request.getDescription() == null ? "" : request.getDescription().trim();

        if (name.isEmpty()) {
            throw new BadRequestException("Resource name is required.");
        }
        if (name.length() < 3) {
            throw new BadRequestException("Resource name must be at least 3 characters long.");
        }
        if (name.length() > 100) {
            throw new BadRequestException("Resource name must be 100 characters or fewer.");
        }
        if (request.getType() == null) {
            throw new BadRequestException("Resource type is required.");
        }
        if (request.getCapacity() == null) {
            throw new BadRequestException("Capacity is required.");
        }
        if (request.getCapacity() <= 0) {
            throw new BadRequestException("Capacity must be greater than 0.");
        }
        if (request.getCapacity() > 1000) {
            throw new BadRequestException("Capacity must be 1000 or fewer.");
        }
        if (location.isEmpty()) {
            throw new BadRequestException("Location is required.");
        }
        if (location.length() > 100) {
            throw new BadRequestException("Location must be 100 characters or fewer.");
        }
        if (description.isEmpty()) {
            throw new BadRequestException("Description is required.");
        }
        if (description.length() > 500) {
            throw new BadRequestException("Description must be 500 characters or fewer.");
        }
        if (request.getAvailableFrom() == null || request.getAvailableTo() == null) {
            throw new BadRequestException("Available from and available to times are required.");
        }
        if (!request.getAvailableFrom().isBefore(request.getAvailableTo())) {
            throw new BadRequestException("Available from time must be earlier than available to time.");
        }
        if (request.getStatus() == null) {
            throw new BadRequestException("Resource status is required.");
        }

        resourceRepository.findFirstByNameIgnoreCaseAndLocationIgnoreCase(name, location)
            .filter(existing -> currentResourceId == null || !existing.getId().equals(currentResourceId))
            .ifPresent(existing -> {
                throw new BadRequestException("A resource with the same name already exists at this location.");
            });
    }
}
