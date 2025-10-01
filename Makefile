DOCKER_REGISTRY_ID = $(word 2,$(MAKECMDGOALS))

# Предотвращаем выполнение аргумента как цели
$(DOCKER_REGISTRY_ID):
	@:

WIDGET_VERSION = 0.1
WIDGET_DOCKER_IMAGE := cr.yandex/$(DOCKER_REGISTRY_ID)/widget:$(WIDGET_VERSION)

image:
	@echo 'Собираем докер-образ с Widget и грузим его в registry'
	@docker buildx build --platform linux/amd64 --no-cache -f Dockerfile -t ${WIDGET_DOCKER_IMAGE} .
	@docker push ${WIDGET_DOCKER_IMAGE}
