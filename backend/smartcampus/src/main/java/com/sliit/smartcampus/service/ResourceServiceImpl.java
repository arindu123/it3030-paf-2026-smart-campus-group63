package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.ResourceRequest;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enums.ResourceStatus;
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
        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
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

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
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
}