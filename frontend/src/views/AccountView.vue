<script setup lang="ts">

</script>

<template>
  <section class="position-relative py-4 py-xl-5">
    <div class="container">
      <div class="row mb-5">
        <div class="col-md-8 col-xl-6 text-center mx-auto">
          <h2>Mon compte</h2>
          <p class="w-lg-50"></p>
        </div>
      </div>
      <div class="row d-flex justify-content-center">
        <div class="col-md-6 col-xl-4">
          <div class="card mb-5 pt-sm-3">
            <h5 class="text-center">Informations générales</h5>
            <div class="card-body d-flex flex-column align-items-center mt-sm-5">
              <form class="text-center" method="post">
                <div class="mb-3"><input class="form-control" type="email" name="email" placeholder="Email">
                  <input class="form-control mt-sm-3" type="email" name="pseudo" placeholder="Pseudo">
                  <button class="btn btn-primary btn-blue border rounded-pill d-block w-100 mt-sm-4" type="submit">Modifier mes informations</button>
                </div>
                <p class="text-muted"></p>
              </form>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-xl-4">
          <div class="card mb-5">
            <div class="card-body d-flex flex-column align-items-center">
              <h5>Mot de passe</h5>
              <form class="text-center" method="post">
                <div class="mb-3"><input class="form-control mt-sm-5" type="password" name="actualPdw" placeholder="Ancien mot passe"><input class="form-control mt-sm-3" type="password" name="newPwd" placeholder="Nouveau mot de passe"><input class="form-control mt-sm-3" type="password" name="confirmPwd" placeholder="Confirmer"></div>
                <div class="mb-3"><button class="btn-primary btn-blue btn border rounded-pill d-block w-100" type="submit">Modifier le mot de passe</button></div>
                <p class="text-muted"></p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col"></div>
      <div class="col"><button class="btn btn-danger border rounded-pill d-block w-100" type="submit">Supprimer mon compte</button></div>
      <div class="col"></div>
    </div>
  </section>
</template>

<style scoped>
.card{
  border: none;
}
</style>
